import {
  createSocialOAuthHandler,
  decryptTokenForTest,
  encryptTokenForTest,
} from "./index.ts";

function createEnv(values: Record<string, string> = {}) {
  return { get: (key: string) => values[key] ?? "" };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function makeFetch(responses: Array<{ status?: number; body: unknown }>) {
  const requests: Array<{ url: string; method: string; headers: Headers; body: string }> = [];
  let index = 0;
  const fetchImpl = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const request = new Request(input, init);
    requests.push({
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: await request.clone().text(),
    });
    const next = responses[index++];
    if (!next) throw new Error("Unexpected outbound request");
    return jsonResponse(next.body, next.status ?? 200);
  };
  return { fetchImpl, requests, calls: () => index };
}

const CEO = {
  id: "ceo-user-1",
  email: "ceo@example.test",
  email_confirmed_at: "2026-11-02T09:00:00Z",
  app_metadata: { provider: "google", providers: ["google"] },
};
const IDENTITY = [{ id: 1, email: CEO.email, auth_user_id: CEO.id }];
const PROFILE = [{ id: CEO.id, papel: "admin" }];
const ENV = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: "sb_publishable_test" }),
  SUPABASE_SECRET_KEYS: JSON.stringify({ default: "sb_secret_server_only" }),
  GOOGLE_OAUTH_CLIENT_ID: "google-client-id",
  GOOGLE_OAUTH_CLIENT_SECRET: "google-client-secret",
  META_APP_ID: "meta-app-id",
  META_APP_SECRET: "meta-app-secret",
  META_GRAPH_API_VERSION: "v26.0",
  META_EMBEDDED_SIGNUP_CONFIG_ID: "meta-config-id",
  SOCIAL_OAUTH_ENCRYPTION_KEY: btoa(String.fromCharCode(...new Uint8Array(32).fill(7))),
};

function post(body: unknown, authorization = "Bearer valid-user-jwt") {
  return new Request("https://edge.test/annan-social-oauth", {
    method: "POST",
    headers: {
      authorization,
      origin: "https://placurso.netlify.app",
      "content-type": "application/json",
      apikey: "sb_publishable_test",
    },
    body: JSON.stringify(body),
  });
}

Deno.test("rejects OAuth start without a user JWT before outbound calls", async () => {
  const mock = makeFetch([]);
  const handler = createSocialOAuthHandler({ env: createEnv(ENV), fetchImpl: mock.fetchImpl });
  const response = await handler(post({ action: "start", provider: "youtube" }, ""));
  if (response.status !== 401) throw new Error(`expected 401, received ${response.status}`);
  if (mock.calls() !== 0) throw new Error("unauthenticated OAuth start made an outbound call");
});

Deno.test("Google OAuth start validates the CEO and persists only a state hash plus PKCE verifier", async () => {
  const mock = makeFetch([
    { body: CEO },
    { body: IDENTITY },
    { body: PROFILE },
    { body: [{ state_hash: "a".repeat(64) }] },
  ]);
  const handler = createSocialOAuthHandler({ env: createEnv(ENV), fetchImpl: mock.fetchImpl });
  const response = await handler(post({ action: "start", provider: "youtube" }));
  const body = await response.json();
  if (!response.ok || body.ok !== true || typeof body.data?.authorizationUrl !== "string") {
    throw new Error("Google OAuth start did not return an authorization URL");
  }
  const url = new URL(body.data.authorizationUrl);
  if (url.origin !== "https://accounts.google.com" || url.pathname !== "/o/oauth2/v2/auth") {
    throw new Error("Google authorization URL did not use the official authorization endpoint");
  }
  if (url.searchParams.get("code_challenge_method") !== "S256" || !url.searchParams.get("code_challenge")) {
    throw new Error("Google OAuth did not enable PKCE S256");
  }
  if (url.searchParams.get("access_type") !== "offline") {
    throw new Error("Google OAuth did not request offline access for refresh tokens");
  }
  if (url.searchParams.has("client_secret")) {
    throw new Error("Google client secret leaked into the browser authorization URL");
  }
  const savedState = JSON.parse(mock.requests[3].body);
  if (!/^[a-f0-9]{64}$/.test(savedState.state_hash)) {
    throw new Error("OAuth state was not stored as a SHA-256 hash");
  }
  if (!savedState.code_verifier || savedState.code_verifier === url.searchParams.get("state")) {
    throw new Error("Google PKCE verifier was not stored separately from state");
  }
  if (body.data.authorizationUrl.includes("google-client-secret")) {
    throw new Error("Google client secret leaked in response");
  }
});

Deno.test("Meta OAuth start requires the server App Secret and never exposes it", async () => {
  const mock = makeFetch([
    { body: CEO },
    { body: IDENTITY },
    { body: PROFILE },
    { body: [{ state_hash: "c".repeat(64) }] },
  ]);
  const handler = createSocialOAuthHandler({ env: createEnv(ENV), fetchImpl: mock.fetchImpl });
  const response = await handler(post({ action: "start", provider: "meta" }));
  const body = await response.json();
  if (!response.ok || typeof body.data?.authorizationUrl !== "string") {
    throw new Error("Meta OAuth start did not return an authorization URL");
  }
  const url = new URL(body.data.authorizationUrl);
  if (url.origin !== "https://www.facebook.com" || !url.pathname.endsWith("/dialog/oauth")) {
    throw new Error("Meta authorization URL did not use the official dialog endpoint");
  }
  if (url.searchParams.get("state")?.split(".", 1)[0] !== "meta") {
    throw new Error("Meta OAuth state was not bound to the Meta provider");
  }
  if (url.searchParams.has("client_secret") || body.data.authorizationUrl.includes("meta-app-secret")) {
    throw new Error("Meta App Secret leaked into the authorization URL");
  }
  if (mock.calls() !== 4) throw new Error("Meta OAuth start did not persist exactly one state row");
});

Deno.test("fails closed when Meta App Secret is missing before creating OAuth state", async () => {
  const mock = makeFetch([
    { body: CEO },
    { body: IDENTITY },
    { body: PROFILE },
  ]);
  const env = { ...ENV };
  delete (env as Record<string,string>).META_APP_SECRET;
  const handler = createSocialOAuthHandler({ env: createEnv(env), fetchImpl: mock.fetchImpl });
  const response = await handler(post({ action: "start", provider: "meta" }));
  if (response.status !== 503) throw new Error("Meta start did not fail closed without App Secret");
  if (mock.requests.some((item) => item.url.includes("growth_oauth_states"))) {
    throw new Error("Meta state row was created before configuration validation");
  }
});

Deno.test("rejects callback with an unknown state without exchanging an authorization code", async () => {
  const mock = makeFetch([{ body: [] }]);
  const handler = createSocialOAuthHandler({ env: createEnv(ENV), fetchImpl: mock.fetchImpl });
  const response = await handler(new Request(
    "https://edge.test/annan-social-oauth?code=one-time-code&state=invalid-state",
  ));
  if (response.status !== 400) throw new Error(`expected 400, received ${response.status}`);
  if (mock.calls() !== 1) throw new Error("invalid state reached an external token endpoint");
});

Deno.test("AES-GCM credential encryption round-trips and binds ciphertext to the account", async () => {
  const key = ENV.SOCIAL_OAUTH_ENCRYPTION_KEY;
  const cipher = await encryptTokenForTest("provider-access-token", key, "meta", "page-123");
  if (cipher.includes("provider-access-token")) throw new Error("provider token appears in ciphertext");
  const restored = await decryptTokenForTest(cipher, key, "meta", "page-123");
  if (restored !== "provider-access-token") throw new Error("encrypted token did not round-trip");
  let rejected = false;
  try {
    await decryptTokenForTest(cipher, key, "meta", "other-page");
  } catch {
    rejected = true;
  }
  if (!rejected) throw new Error("ciphertext was not bound to provider/account associated data");
});

Deno.test("WhatsApp Embedded Signup refuses completion for a different CEO owner", async () => {
  const mock = makeFetch([
    { body: CEO },
    { body: IDENTITY },
    { body: PROFILE },
    { body: [{
      state_hash: "b".repeat(64),
      platform: "whatsapp",
      created_by: "another-user",
      code_verifier: null,
      expires_at: "2026-11-02T11:00:00Z",
      used_at: null,
    }] },
  ]);
  const handler = createSocialOAuthHandler({ env: createEnv(ENV), fetchImpl: mock.fetchImpl });
  const response = await handler(post({
    action: "whatsapp.complete",
    payload: {
      code: "one-time-code",
      state: "whatsapp-state",
      wabaId: "waba-1",
      phoneNumberId: "phone-1",
    },
  }));
  if (response.status !== 403) throw new Error("WhatsApp code was accepted for another CEO identity");
  if (mock.requests.some((item) => item.url.includes("graph.facebook.com"))) {
    throw new Error("WhatsApp state owner mismatch reached Meta");
  }
});

Deno.test("OAuth errors never reveal tokens, client secrets, or the encryption key", async () => {
  const mock = makeFetch([{ status: 401, body: { message: "invalid token" } }]);
  const handler = createSocialOAuthHandler({ env: createEnv(ENV), fetchImpl: mock.fetchImpl });
  const response = await handler(post({ action: "start", provider: "youtube" }));
  const text = await response.text();
  for (const secret of [
    "google-client-secret",
    "meta-app-secret",
    ENV.SOCIAL_OAUTH_ENCRYPTION_KEY,
    "sb_secret_server_only",
  ]) {
    if (text.includes(secret)) throw new Error("secret material leaked in response");
  }
});
