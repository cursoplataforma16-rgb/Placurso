// Phase 10.5 — server-side social OAuth for the existing ANNAN runtime.
// Deploy with verify_jwt=false because external OAuth callbacks do not carry Supabase JWTs.
// Every panel-originated operation validates the CEO JWT, singleton identity and admin profile.
// Provider tokens are AES-256-GCM encrypted before persistence and never returned to the browser.

const CALLBACK_URL = "https://ebdrrsrvjsdjthatfbcd.supabase.co/functions/v1/annan-social-oauth";
const CEO_URL = "https://placurso.netlify.app/ceo";
const MAX_BODY_BYTES = 16_000;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const META_SCOPES = [
  "pages_show_list",
  "pages_read_engagement",
  "pages_manage_posts",
  "instagram_basic",
  "instagram_content_publish",
  "instagram_manage_comments",
  "instagram_manage_insights",
];
const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/youtube.upload",
];
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type OAuthEnvironment = { get(name: string): string | undefined };
type OAuthFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type OAuthDependencies = { env: OAuthEnvironment; fetchImpl?: OAuthFetch };

class OAuthError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) {
    super(code);
    this.name = "OAuthError";
    this.status = status;
    this.code = code;
  }
}

function jsonResponse(status: number, body: unknown, origin = "") {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "pragma": "no-cache",
    "x-content-type-options": "nosniff",
    "vary": "Origin",
  });
  if (isAllowedOrigin(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
    headers.set("access-control-allow-headers", "authorization, apikey, content-type, x-client-info");
    headers.set("access-control-max-age", "600");
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:") return false;
    return url.hostname === "placurso.netlify.app"
      || url.hostname === "main--placurso.netlify.app"
      || /^deploy-preview-\d+--placurso\.netlify\.app$/.test(url.hostname);
  } catch {
    return false;
  }
}

function readKey(env: OAuthEnvironment, jsonName: string, legacyName: string): string {
  const raw = env.get(jsonName);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.default === "string" && parsed.default) return parsed.default;
    } catch {
      return "";
    }
  }
  return env.get(legacyName) || "";
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  let binary = "";
  try {
    binary = atob(padded);
  } catch {
    throw new OAuthError(503, "oauth_encryption_key_invalid");
  }
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomToken(byteLength = 32): string {
  return encodeBase64Url(crypto.getRandomValues(new Uint8Array(byteLength)));
}

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function sha256Hex(value: string): Promise<string> {
  return Array.from(await sha256(value)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function createPkceChallenge(verifier: string): Promise<string> {
  return encodeBase64Url(await sha256(verifier));
}

async function importEncryptionKey(base64Key: string, usage: KeyUsage[]): Promise<CryptoKey> {
  const bytes = decodeBase64(base64Key);
  if (bytes.byteLength !== 32) throw new OAuthError(503, "oauth_encryption_key_invalid");
  return await crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, usage);
}

async function encryptCredential(value: string, base64Key: string, platform: string, accountId: string): Promise<string> {
  if (!value) throw new OAuthError(400, "empty_oauth_credential");
  const key = await importEncryptionKey(base64Key, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const additionalData = encoder.encode(platform + ":" + accountId + ":v1");
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData, tagLength: 128 },
    key,
    encoder.encode(value),
  );
  return "v1." + encodeBase64Url(iv) + "." + encodeBase64Url(new Uint8Array(encrypted));
}

async function decryptCredential(value: string, base64Key: string, platform: string, accountId: string): Promise<string> {
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") throw new OAuthError(400, "oauth_ciphertext_invalid");
  const key = await importEncryptionKey(base64Key, ["decrypt"]);
  const iv = decodeBase64(parts[1]);
  const ciphertext = decodeBase64(parts[2]);
  const additionalData = encoder.encode(platform + ":" + accountId + ":v1");
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv, additionalData, tagLength: 128 },
    key,
    ciphertext,
  );
  return decoder.decode(decrypted);
}

// Exported only so Deno tests can prove the server-side encryption contract.
export const encryptTokenForTest = encryptCredential;
export const decryptTokenForTest = decryptCredential;

function safeMessage(status: number): string {
  if (status === 400) return "O pedido de ligação é inválido ou já expirou. Reinicie a ligação.";
  if (status === 401) return "A sessão não é válida. Entre novamente no Placurso.";
  if (status === 403) return "Esta operação está reservada à conta de gestão autorizada.";
  if (status === 404) return "A conta social solicitada não foi encontrada.";
  if (status === 409) return "Este pedido de autorização já foi utilizado. Reinicie a ligação.";
  if (status === 503) return "A configuração segura das integrações ainda não está concluída.";
  return "Não foi possível concluir a ligação. Verifique a configuração da aplicação e tente novamente.";
}

function errorResponse(error: unknown, origin = "") {
  const known = error instanceof OAuthError ? error : new OAuthError(500, "internal_error");
  return jsonResponse(known.status, {
    ok: false,
    error: { code: known.code, message: safeMessage(known.status) },
  }, origin);
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    throw new OAuthError(413, "payload_too_large");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new OAuthError(400, "invalid_json");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new OAuthError(400, "invalid_body");
  }
  return parsed as Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((item) => item && typeof item === "object") as Array<Record<string, unknown>> : [];
}

function safeProviderError(value: unknown): string {
  const record = asRecord(value);
  const code = typeof record.error === "string" ? record.error : "";
  const subcode = typeof record.error_subcode === "number" ? String(record.error_subcode) : "";
  return (code + (subcode ? "_" + subcode : "")).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80) || "provider_error";
}

export function createSocialOAuthHandler({ env, fetchImpl = fetch }: OAuthDependencies) {
  if (!env || typeof env.get !== "function") throw new Error("Social OAuth handler requires an environment reader");

  const supabaseUrl = (env.get("SUPABASE_URL") || "").replace(/\/+$/, "");
  const publishableKey = readKey(env, "SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");
  const graphVersion = (env.get("META_GRAPH_API_VERSION") || "v26.0").trim();

  function required(name: string): string {
    const value = env.get(name) || "";
    if (!value) throw new OAuthError(503, "social_provider_configuration_missing");
    return value;
  }

  function encryptionKey(): string {
    const value = required("SOCIAL_OAUTH_ENCRYPTION_KEY");
    const bytes = decodeBase64(value);
    if (bytes.byteLength !== 32) throw new OAuthError(503, "oauth_encryption_key_invalid");
    return value;
  }

  async function dbRequest(path: string, options: {
    method?: string;
    body?: unknown;
    prefer?: string;
  } = {}): Promise<unknown> {
    if (!supabaseUrl) throw new OAuthError(503, "server_configuration_missing");
    const key = readKey(env, "SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    if (!key) throw new OAuthError(503, "server_configuration_missing");
    const headers = new Headers({ apikey: key, accept: "application/json" });
    if (options.body !== undefined) headers.set("content-type", "application/json");
    if (options.prefer) headers.set("prefer", options.prefer);
    const response = await fetchImpl(supabaseUrl + "/rest/v1/" + path, {
      method: options.method || "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    const text = await response.text();
    let result: unknown = null;
    if (text) {
      try { result = JSON.parse(text); } catch { result = null; }
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) throw new OAuthError(503, "server_database_configuration");
      if (response.status === 404) throw new OAuthError(404, "record_not_found");
      if (response.status === 409) throw new OAuthError(409, "duplicate_or_replayed_request");
      throw new OAuthError(502, "database_operation_failed");
    }
    return result;
  }

  async function callAuth(userJwt: string): Promise<Record<string, unknown> & { id: string }> {
    if (!supabaseUrl || !publishableKey) throw new OAuthError(503, "server_configuration_missing");
    const response = await fetchImpl(supabaseUrl + "/auth/v1/user", {
      method: "GET",
      headers: { apikey: publishableKey, authorization: userJwt, accept: "application/json" },
    });
    if (!response.ok) throw new OAuthError(401, "invalid_session");
    const user = asRecord(await response.json());
    if (typeof user.id !== "string" || !user.id) throw new OAuthError(401, "invalid_session");
    return user as Record<string, unknown> & { id: string };
  }

  function isConfirmedGoogleIdentity(user: Record<string, unknown>): boolean {
    const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
    const confirmed = Boolean(user.email_confirmed_at || user.confirmed_at);
    const appMetadata = asRecord(user.app_metadata);
    const provider = typeof appMetadata.provider === "string" ? appMetadata.provider.toLowerCase() : "";
    const providers = Array.isArray(appMetadata.providers)
      ? appMetadata.providers.map((item) => String(item).toLowerCase()) : [];
    return Boolean(email) && confirmed && (provider === "google" || providers.includes("google"));
  }

  async function authorizeCEO(request: Request): Promise<{ id: string; email: string }> {
    const authorization = request.headers.get("authorization") || "";
    if (!/^Bearer\s+\S+$/i.test(authorization)) throw new OAuthError(401, "missing_session");
    const user = await callAuth(authorization);
    const identities = asArray(await dbRequest(
      "growth_ceo_identity?select=email%2Cauth_user_id&id=eq.1&limit=1",
    ));
    const identity = identities[0];
    const profileRows = asArray(await dbRequest(
      "perfis?select=id%2Cpapel&id=eq." + encodeURIComponent(user.id) + "&limit=1",
    ));
    const profile = profileRows[0];
    const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
    const expectedEmail = typeof identity?.email === "string" ? identity.email.trim().toLowerCase() : "";
    if (!identity || !identity.auth_user_id || identity.auth_user_id !== user.id
      || !isConfirmedGoogleIdentity(user) || !email || email !== expectedEmail
      || !profile || profile.id !== user.id || profile.papel !== "admin") {
      throw new OAuthError(403, "forbidden");
    }
    return { id: user.id, email };
  }

  async function assertCEOStillActive(actorId: string): Promise<void> {
    const identities = asArray(await dbRequest(
      "growth_ceo_identity?select=auth_user_id&id=eq.1&limit=1",
    ));
    const identity = identities[0];
    const profiles = asArray(await dbRequest(
      "perfis?select=id%2Cpapel&id=eq." + encodeURIComponent(actorId) + "&limit=1",
    ));
    if (!identity || identity.auth_user_id !== actorId
      || !profiles[0] || profiles[0].id !== actorId || profiles[0].papel !== "admin") {
      throw new OAuthError(403, "forbidden");
    }
  }

  async function createState(platform: string, actorId: string, scopes: string[], codeVerifier: string | null): Promise<string> {
    const rawState = platform + "." + randomToken(32);
    const stateHash = await sha256Hex(rawState);
    const now = Date.now();
    await dbRequest("growth_oauth_states", {
      method: "POST",
      prefer: "return=minimal",
      body: [{
        state_hash: stateHash,
        platform,
        created_by: actorId,
        code_verifier: codeVerifier,
        requested_scopes: scopes,
        expires_at: new Date(now + 10 * 60 * 1000).toISOString(),
      }],
    });
    return rawState;
  }

  async function consumeState(rawState: string, expectedPlatform: string): Promise<{
    platform: string;
    created_by: string;
    code_verifier: string | null;
    requested_scopes: string[];
  }> {
    if (!rawState || rawState.length > 256) throw new OAuthError(400, "invalid_oauth_state");
    const stateHash = await sha256Hex(rawState);
    const result = await dbRequest("rpc/consume_growth_oauth_state", {
      method: "POST",
      prefer: "return=representation",
      body: { p_state_hash: stateHash, p_expected_platform: expectedPlatform },
    });
    const row = Array.isArray(result) ? result[0] : result;
    if (!row || typeof row !== "object" || (row as Record<string, unknown>).platform !== expectedPlatform) {
      throw new OAuthError(400, "invalid_expired_or_replayed_state");
    }
    const state = row as Record<string, unknown>;
    if (typeof state.created_by !== "string") throw new OAuthError(400, "invalid_oauth_state_owner");
    return {
      platform: expectedPlatform,
      created_by: state.created_by,
      code_verifier: typeof state.code_verifier === "string" ? state.code_verifier : null,
      requested_scopes: Array.isArray(state.requested_scopes) ? state.requested_scopes.map(String) : [],
    };
  }

  async function startAuthorization(provider: "meta" | "youtube", actorId: string): Promise<string> {
    encryptionKey();
    if (provider === "meta") {
      const appId = required("META_APP_ID");
      required("META_APP_SECRET");
      if (!/^v\d+\.\d+$/.test(graphVersion)) throw new OAuthError(503, "meta_graph_version_invalid");
      const state = await createState("meta", actorId, META_SCOPES, null);
      const url = new URL("https://www.facebook.com/" + graphVersion + "/dialog/oauth");
      url.searchParams.set("client_id", appId);
      url.searchParams.set("redirect_uri", CALLBACK_URL);
      url.searchParams.set("state", state);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("return_scopes", "true");
      url.searchParams.set("auth_type", "rerequest");
      url.searchParams.set("scope", META_SCOPES.join(","));
      return url.toString();
    }

    const clientId = required("GOOGLE_OAUTH_CLIENT_ID");
    required("GOOGLE_OAUTH_CLIENT_SECRET");
    const verifier = randomToken(48);
    const state = await createState("youtube", actorId, YOUTUBE_SCOPES, verifier);
    const challenge = await createPkceChallenge(verifier);
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", CALLBACK_URL);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", YOUTUBE_SCOPES.join(" "));
    url.searchParams.set("state", state);
    url.searchParams.set("access_type", "offline");
    url.searchParams.set("prompt", "consent");
    url.searchParams.set("include_granted_scopes", "true");
    url.searchParams.set("code_challenge", challenge);
    url.searchParams.set("code_challenge_method", "S256");
    return url.toString();
  }

  async function startWhatsAppSignup(actorId: string) {
    encryptionKey();
    const appId = required("META_APP_ID");
    required("META_APP_SECRET");
    const configId = required("META_EMBEDDED_SIGNUP_CONFIG_ID");
    if (!/^v\\d+\\.\\d+$/.test(graphVersion)) throw new OAuthError(503, "meta_graph_version_invalid");
    const state = await createState("whatsapp", actorId, [], null);
    return { appId, configId, state, graphVersion };
  }

  async function providerJson(response: Response, safeCode: string): Promise<Record<string, unknown>> {
    let data: Record<string, unknown> = {};
    try { data = asRecord(await response.json()); } catch { data = {}; }
    if (!response.ok || data.error) throw new OAuthError(502, safeCode + "_" + safeProviderError(data));
    return data;
  }

  async function metaGraph(path: string, token: string): Promise<Record<string, unknown>> {
    const url = new URL("https://graph.facebook.com/" + graphVersion + "/" + path.replace(/^\//, ""));
    const response = await fetchImpl(url, {
      headers: { authorization: "Bearer " + token, accept: "application/json" },
    });
    return await providerJson(response, "meta_graph");
  }

  async function exchangeMetaCode(code: string, embedded = false): Promise<Record<string, unknown>> {
    const url = new URL("https://graph.facebook.com/" + graphVersion + "/oauth/access_token");
    url.searchParams.set("client_id", required("META_APP_ID"));
    url.searchParams.set("client_secret", required("META_APP_SECRET"));
    url.searchParams.set("code", code);
    if (!embedded) url.searchParams.set("redirect_uri", CALLBACK_URL);
    const response = await fetchImpl(url, { method: "GET", headers: { accept: "application/json" } });
    return await providerJson(response, "meta_token_exchange");
  }

  async function longLivedMetaToken(shortToken: string): Promise<Record<string, unknown>> {
    const url = new URL("https://graph.facebook.com/" + graphVersion + "/oauth/access_token");
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", required("META_APP_ID"));
    url.searchParams.set("client_secret", required("META_APP_SECRET"));
    url.searchParams.set("fb_exchange_token", shortToken);
    const response = await fetchImpl(url, { method: "GET", headers: { accept: "application/json" } });
    return await providerJson(response, "meta_long_lived_exchange");
  }

  async function findAccount(platform: string, externalId: string, actorId: string) {
    const query = "growth_accounts?select=id%2Cplatform%2Cexternal_account_id%2Cdisplay_name%2Cconnection_state"
      + "&platform=eq." + encodeURIComponent(platform)
      + "&external_account_id=eq." + encodeURIComponent(externalId)
      + "&created_by=eq." + encodeURIComponent(actorId)
      + "&limit=1";
    return asArray(await dbRequest(query))[0] || null;
  }

  async function saveAccount(input: {
    platform: string;
    externalId: string;
    displayName: string;
    accountType: string;
    capabilities: string[];
    actorId: string;
  }): Promise<Record<string, unknown>> {
    const existing = await findAccount(input.platform, input.externalId, input.actorId);
    const values = {
      display_name: input.displayName.slice(0, 160),
      account_type: input.accountType.slice(0, 60),
      connection_state: "connected",
      capabilities: input.capabilities,
      updated_at: new Date().toISOString(),
    };
    if (existing && typeof existing.id === "string") {
      const updated = await dbRequest(
        "growth_accounts?id=eq." + encodeURIComponent(existing.id)
          + "&created_by=eq." + encodeURIComponent(input.actorId),
        { method: "PATCH", prefer: "return=representation", body: values },
      );
      const row = asArray(updated)[0];
      if (!row) throw new OAuthError(502, "social_account_update_failed");
      return row;
    }

    const inserted = await dbRequest("growth_accounts", {
      method: "POST",
      prefer: "return=representation",
      body: [{
        platform: input.platform,
        external_account_id: input.externalId,
        created_by: input.actorId,
        ...values,
      }],
    });
    const row = asArray(inserted)[0];
    if (!row) throw new OAuthError(502, "social_account_create_failed");
    return row;
  }

  async function saveCredential(input: {
    accountId: string;
    platform: string;
    accessToken: string;
    refreshToken?: string | null;
    expiresIn?: number | null;
    tokenType?: string;
    scopes: string[];
  }): Promise<void> {
    const key = encryptionKey();
    const encryptedAccess = await encryptCredential(input.accessToken, key, input.platform, input.accountId);
    const encryptedRefresh = input.refreshToken
      ? await encryptCredential(input.refreshToken, key, input.platform, input.accountId + ":refresh")
      : null;
    const expiresAt = Number.isFinite(input.expiresIn) && Number(input.expiresIn) > 0
      ? new Date(Date.now() + Number(input.expiresIn) * 1000).toISOString() : null;
    const existing = await dbRequest(
      "growth_oauth_credentials?select=account_id&account_id=eq." + encodeURIComponent(input.accountId) + "&limit=1",
    );
    const values = {
      encrypted_access_token: encryptedAccess,
      encrypted_refresh_token: encryptedRefresh,
      token_expires_at: expiresAt,
      token_type: input.tokenType || "Bearer",
      scopes: input.scopes,
      encryption_version: 1,
      updated_at: new Date().toISOString(),
    };
    if (asArray(existing).length) {
      await dbRequest("growth_oauth_credentials?account_id=eq." + encodeURIComponent(input.accountId), {
        method: "PATCH", prefer: "return=minimal", body: values,
      });
    } else {
      await dbRequest("growth_oauth_credentials", {
        method: "POST", prefer: "return=minimal", body: [{ account_id: input.accountId, ...values }],
      });
    }
  }

  async function auditConnected(actorId: string, accountId: string, platform: string): Promise<void> {
    await dbRequest("growth_audit_log", {
      method: "POST",
      prefer: "return=minimal",
      body: [{
        request_id: crypto.randomUUID(),
        actor_id: actorId,
        action: "account.oauth.connect",
        object_type: "account",
        object_id: accountId,
        outcome: "success",
        details: { platform },
        completed_at: new Date().toISOString(),
      }],
    });
  }

  async function grantedMetaPermissions(token: string): Promise<Set<string>> {
    const response = await metaGraph("me/permissions?limit=100", token);
    return new Set(asArray(response.data)
      .filter((item) => item.status === "granted" && typeof item.permission === "string")
      .map((item) => String(item.permission)));
  }

  async function connectMetaPages(actorId: string, code: string): Promise<number> {
    const short = await exchangeMetaCode(code);
    const shortToken = typeof short.access_token === "string" ? short.access_token : "";
    if (!shortToken) throw new OAuthError(502, "meta_token_missing");
    const long = await longLivedMetaToken(shortToken);
    const token = typeof long.access_token === "string" ? long.access_token : shortToken;
    const granted = await grantedMetaPermissions(token);
    if (!granted.has("pages_show_list")) {
      throw new OAuthError(403, "meta_pages_show_list_permission_missing");
    }

    const pageFields = ["id", "name", "access_token", "tasks"];
    if (granted.has("instagram_basic")) {
      pageFields.push("instagram_business_account{id,username}");
    }
    const pagesData = await metaGraph(
      "me/accounts?fields=" + encodeURIComponent(pageFields.join(",")) + "&limit=100",
      token,
    );
    const pages = asArray(pagesData.data);
    if (!pages.length) throw new OAuthError(400, "meta_no_manageable_pages");

    let connected = 0;
    for (const page of pages) {
      const pageId = typeof page.id === "string" ? page.id : "";
      const pageName = typeof page.name === "string" ? page.name : "Facebook Page";
      const pageToken = typeof page.access_token === "string" ? page.access_token : "";
      if (!pageId || !pageToken) continue;

      const pageCapabilities = ["pages.list"];
      if (granted.has("pages_read_engagement")) pageCapabilities.push("pages.read");
      if (granted.has("pages_manage_posts")) pageCapabilities.push("pages.publish");
      const pageRow = await saveAccount({
        platform: "facebook",
        externalId: pageId,
        displayName: pageName,
        accountType: "facebook_page",
        capabilities: pageCapabilities,
        actorId,
      });
      await saveCredential({
        accountId: String(pageRow.id),
        platform: "facebook",
        accessToken: pageToken,
        expiresIn: Number(long.expires_in) || Number(short.expires_in) || null,
        tokenType: "Bearer",
        scopes: Array.from(granted),
      });
      await auditConnected(actorId, String(pageRow.id), "facebook");
      connected++;

      const instagram = asRecord(page.instagram_business_account);
      const instagramId = typeof instagram.id === "string" ? instagram.id : "";
      if (instagramId && granted.has("instagram_basic")) {
        const instagramCapabilities = ["instagram.read"];
        if (granted.has("instagram_content_publish")) instagramCapabilities.push("instagram.publish");
        if (granted.has("instagram_manage_insights")) instagramCapabilities.push("instagram.insights");
        const username = typeof instagram.username === "string" ? instagram.username : "Instagram profissional";
        const igRow = await saveAccount({
          platform: "instagram",
          externalId: instagramId,
          displayName: username,
          accountType: "instagram_professional",
          capabilities: instagramCapabilities,
          actorId,
        });
        await saveCredential({
          accountId: String(igRow.id),
          platform: "instagram",
          accessToken: pageToken,
          expiresIn: Number(long.expires_in) || Number(short.expires_in) || null,
          tokenType: "Bearer",
          scopes: Array.from(granted),
        });
        await auditConnected(actorId, String(igRow.id), "instagram");
        connected++;
      }
    }
    if (!connected) throw new OAuthError(400, "meta_no_supported_accounts");
    return connected;
  }

  async function connectYouTube(actorId: string, code: string, codeVerifier: string | null): Promise<void> {
    if (!codeVerifier) throw new OAuthError(400, "google_pkce_verifier_missing");
    const form = new URLSearchParams();
    form.set("client_id", required("GOOGLE_OAUTH_CLIENT_ID"));
    form.set("client_secret", required("GOOGLE_OAUTH_CLIENT_SECRET"));
    form.set("code", code);
    form.set("code_verifier", codeVerifier);
    form.set("grant_type", "authorization_code");
    form.set("redirect_uri", CALLBACK_URL);
    const response = await fetchImpl("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", accept: "application/json" },
      body: form.toString(),
    });
    const tokens = await providerJson(response, "google_token_exchange");
    const accessToken = typeof tokens.access_token === "string" ? tokens.access_token : "";
    const refreshToken = typeof tokens.refresh_token === "string" ? tokens.refresh_token : "";
    if (!accessToken || !refreshToken) throw new OAuthError(400, "google_refresh_token_missing");

    const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
    channelUrl.searchParams.set("part", "snippet");
    channelUrl.searchParams.set("mine", "true");
    const channelResponse = await fetchImpl(channelUrl, {
      headers: { authorization: "Bearer " + accessToken, accept: "application/json" },
    });
    const channelData = await providerJson(channelResponse, "youtube_channel_lookup");
    const items = asArray(channelData.items);
    const channel = items[0];
    if (!channel || typeof channel.id !== "string") throw new OAuthError(400, "youtube_channel_not_found");
    const snippet = asRecord(channel.snippet);
    const title = typeof snippet.title === "string" ? snippet.title : "Canal YouTube";
    const scopes = typeof tokens.scope === "string" ? tokens.scope.split(/\s+/).filter(Boolean) : YOUTUBE_SCOPES;
    const account = await saveAccount({
      platform: "youtube",
      externalId: channel.id,
      displayName: title,
      accountType: "youtube_channel",
      capabilities: ["youtube.channel.read", "youtube.video.upload"],
      actorId,
    });
    await saveCredential({
      accountId: String(account.id),
      platform: "youtube",
      accessToken,
      refreshToken,
      expiresIn: Number(tokens.expires_in) || null,
      tokenType: typeof tokens.token_type === "string" ? tokens.token_type : "Bearer",
      scopes,
    });
    await auditConnected(actorId, String(account.id), "youtube");
  }

  async function inspectMetaAccessToken(token: string): Promise<Set<string>> {
    const appId = required("META_APP_ID");
    const appSecret = required("META_APP_SECRET");
    const url = new URL("https://graph.facebook.com/" + graphVersion + "/debug_token");
    url.searchParams.set("input_token", token);
    url.searchParams.set("access_token", appId + "|" + appSecret);
    const response = await fetchImpl(url, { headers: { accept: "application/json" } });
    const result = await providerJson(response, "meta_token_inspection");
    const data = asRecord(result.data);
    if (data.is_valid !== true || String(data.app_id || "") !== appId) {
      throw new OAuthError(403, "whatsapp_token_not_valid_for_this_app");
    }
    const scopes = Array.isArray(data.scopes) ? data.scopes.map(String) : [];
    return new Set(scopes);
  }

  async function completeWhatsApp(actorId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const code = typeof payload.code === "string" ? payload.code.trim() : "";
    const rawState = typeof payload.state === "string" ? payload.state : "";
    const wabaId = typeof payload.wabaId === "string" ? payload.wabaId.trim() : "";
    const phoneNumberId = typeof payload.phoneNumberId === "string" ? payload.phoneNumberId.trim() : "";
    if (!code || !rawState || !/^\\d{5,30}$/.test(wabaId) || !/^\\d{5,30}$/.test(phoneNumberId)) {
      throw new OAuthError(400, "invalid_whatsapp_signup_payload");
    }
    const state = await consumeState(rawState, "whatsapp");
    if (state.created_by !== actorId) throw new OAuthError(403, "forbidden");
    await assertCEOStillActive(actorId);

    const exchanged = await exchangeMetaCode(code, true);
    const token = typeof exchanged.access_token === "string" ? exchanged.access_token : "";
    if (!token) throw new OAuthError(502, "whatsapp_token_missing");

    const grantedScopes = await inspectMetaAccessToken(token);
    if (!grantedScopes.has("whatsapp_business_management")
      || !grantedScopes.has("whatsapp_business_messaging")) {
      throw new OAuthError(403, "whatsapp_permissions_missing");
    }

    const business = await metaGraph(wabaId + "?fields=id%2Cname", token);
    if (String(business.id || "") !== wabaId) {
      throw new OAuthError(403, "whatsapp_business_account_mismatch");
    }
    const phoneNumbers = await metaGraph(
      wabaId + "/phone_numbers?fields=id%2Cdisplay_phone_number%2Cverified_name&limit=100",
      token,
    );
    const phone = asArray(phoneNumbers.data).find((item) => String(item.id || "") === phoneNumberId);
    if (!phone) throw new OAuthError(403, "whatsapp_phone_not_owned_by_business_account");

    const displayPhone = typeof phone.display_phone_number === "string" ? phone.display_phone_number : phoneNumberId;
    const verifiedName = typeof phone.verified_name === "string" ? phone.verified_name : "WhatsApp Business";
    const businessName = typeof business.name === "string" ? business.name : verifiedName;
    const account = await saveAccount({
      platform: "whatsapp",
      externalId: wabaId,
      displayName: businessName + " · " + displayPhone,
      accountType: "whatsapp_business_account",
      capabilities: ["whatsapp.business.read", "whatsapp.messages.send"],
      actorId,
    });
    await saveCredential({
      accountId: String(account.id),
      platform: "whatsapp",
      accessToken: token,
      expiresIn: Number(exchanged.expires_in) || null,
      tokenType: "Bearer",
      scopes: Array.from(grantedScopes),
    });
    await auditConnected(actorId, String(account.id), "whatsapp");
    return { id: account.id, platform: "whatsapp", display_name: account.display_name, connection_state: "connected" };
  }

  async function disconnectAccount(actorId: string, accountId: string): Promise<void> {
    if (!UUID_PATTERN.test(accountId)) throw new OAuthError(400, "invalid_account_id");
    const rows = asArray(await dbRequest(
      "growth_accounts?select=id%2Cplatform%2Ccreated_by&id=eq." + encodeURIComponent(accountId)
        + "&created_by=eq." + encodeURIComponent(actorId) + "&limit=1",
    ));
    const account = rows[0];
    if (!account || account.id !== accountId || account.created_by !== actorId) throw new OAuthError(404, "record_not_found");
    await dbRequest("growth_oauth_credentials?account_id=eq." + encodeURIComponent(accountId), {
      method: "DELETE",
      prefer: "return=minimal",
    });
    await dbRequest("growth_accounts?id=eq." + encodeURIComponent(accountId)
      + "&created_by=eq." + encodeURIComponent(actorId), {
      method: "PATCH",
      prefer: "return=minimal",
      body: { connection_state: "revoked", capabilities: [], updated_at: new Date().toISOString() },
    });
    await dbRequest("growth_audit_log", {
      method: "POST",
      prefer: "return=minimal",
      body: [{
        request_id: crypto.randomUUID(),
        actor_id: actorId,
        action: "account.oauth.disconnect",
        object_type: "account",
        object_id: accountId,
        outcome: "success",
        details: { platform: String(account.platform || "") },
        completed_at: new Date().toISOString(),
      }],
    });
  }

  function callbackRedirect(provider: string, result: "connected" | "error", reason = ""): Response {
    const target = new URL(CEO_URL);
    target.searchParams.set("social", result);
    target.searchParams.set("provider", provider);
    if (reason) target.searchParams.set("reason", reason.slice(0, 80));
    return Response.redirect(target.toString(), 303);
  }

  async function handleCallback(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const stateRaw = url.searchParams.get("state") || "";
    const provider = stateRaw.split(".", 1)[0];
    if (!["meta", "youtube"].includes(provider)) return callbackRedirect("unknown", "error", "invalid_state");
    let state: Awaited<ReturnType<typeof consumeState>>;
    try {
      state = await consumeState(stateRaw, provider);
      await assertCEOStillActive(state.created_by);
      if (url.searchParams.has("error")) {
        return callbackRedirect(provider, "error", "authorization_denied");
      }
      const code = url.searchParams.get("code") || "";
      if (!code) throw new OAuthError(400, "oauth_code_missing");
      if (provider === "meta") {
        await connectMetaPages(state.created_by, code);
      } else {
        await connectYouTube(state.created_by, code, state.code_verifier);
      }
      return callbackRedirect(provider, "connected");
    } catch (error) {
      const code = error instanceof OAuthError ? error.code : "provider_callback_failed";
      return callbackRedirect(provider, "error", code);
    }
  }

  async function handle(request: Request): Promise<Response> {
    const origin = request.headers.get("origin") || "";
    if (request.method === "OPTIONS") return jsonResponse(204, {}, origin);
    if (request.method === "GET") return await handleCallback(request);
    if (request.method !== "POST") return jsonResponse(405, { ok: false, error: { code: "method_not_allowed", message: "Método não permitido." } }, origin);

    try {
      const body = await readBody(request);
      const actor = await authorizeCEO(request);
      const action = typeof body.action === "string" ? body.action : "";
      if (action === "start") {
        const provider = body.provider === "meta" ? "meta" : body.provider === "youtube" ? "youtube" : "";
        if (!provider) throw new OAuthError(400, "unsupported_social_provider");
        const authorizationUrl = await startAuthorization(provider, actor.id);
        return jsonResponse(200, { ok: true, data: { authorizationUrl } }, origin);
      }
      if (action === "whatsapp.start") {
        return jsonResponse(200, { ok: true, data: await startWhatsAppSignup(actor.id) }, origin);
      }
      if (action === "whatsapp.complete") {
        const payload = asRecord(body.payload);
        const account = await completeWhatsApp(actor.id, payload);
        return jsonResponse(200, { ok: true, data: { account } }, origin);
      }
      if (action === "disconnect") {
        const payload = asRecord(body.payload);
        const accountId = typeof payload.accountId === "string" ? payload.accountId : "";
        await disconnectAccount(actor.id, accountId);
        return jsonResponse(200, { ok: true, data: { disconnected: true, accountId } }, origin);
      }
      throw new OAuthError(400, "unknown_oauth_operation");
    } catch (error) {
      return errorResponse(error, origin);
    }
  }

  return handle;
}

if (import.meta.main) {
  Deno.serve(createSocialOAuthHandler({ env: Deno.env, fetchImpl: fetch }));
}
