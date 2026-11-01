// Phase 10.2 — secure Growth capability of the existing ANNAN runtime.
// Deployment contract: publish this function with verify_jwt = true.
// No provider publishing, OAuth or advertising spend is implemented in this phase.

const MAX_BODY_BYTES = 32_000;
const MAX_TEXT_LENGTH = 8_000;
const ALLOWED_PLATFORMS = ["facebook", "instagram", "tiktok", "youtube", "whatsapp", "x"];
const ALLOWED_FORMATS = ["text", "image", "video", "reel", "carousel", "story", "short"];
const ALLOWED_OBJECTIVES = ["awareness", "traffic", "leads", "enrollments", "sales"];
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

function jsonResponse(status, body, origin = "") {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "vary": "Origin",
  });
  if (isAllowedOrigin(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "POST, OPTIONS");
    headers.set("access-control-allow-headers", "authorization, apikey, content-type, x-client-info");
    headers.set("access-control-max-age", "600");
  }
  return new Response(status === 204 ? null : JSON.stringify(body), { status, headers });
}

function isAllowedOrigin(origin) {
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

function readKey(env, jsonName, legacyName) {
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

function safeErrorMessage(status) {
  if (status === 401) return "A sessão não é válida. Entre novamente no Placurso.";
  if (status === 403) return "Esta operação está reservada à conta de gestão autorizada.";
  if (status === 404) return "O registo solicitado não foi encontrado.";
  if (status === 409) return "Este pedido já foi processado ou o conteúdo foi alterado.";
  if (status === 503) return "A configuração administrativa do Crescimento ainda não está concluída.";
  return "Não foi possível concluir a operação. Verifique os dados e tente novamente.";
}

function failure(status, code, origin = "") {
  return jsonResponse(status, {
    ok: false,
    error: { code, message: safeErrorMessage(status) },
  }, origin);
}

async function readRequestBody(request) {
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return { ok: false, status: 413, code: "payload_too_large" };
  }
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, status: 400, code: "invalid_body" };
    }
    return { ok: true, value };
  } catch {
    return { ok: false, status: 400, code: "invalid_json" };
  }
}

function normalizeText(value, maxLength = MAX_TEXT_LENGTH) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateRequestId(value) {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}

function parseDbResponse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

type GrowthEnvironment = { get(name: string): string | undefined };
type GrowthFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type GrowthDependencies = { env: GrowthEnvironment; fetchImpl?: GrowthFetch };

class GrowthRequestError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string) {
    super(code);
    this.name = "GrowthRequestError";
    this.status = status;
    this.code = code;
  }
}

export function createGrowthHandler({ env, fetchImpl = fetch }: GrowthDependencies) {
  if (!env || typeof env.get !== "function") {
    throw new Error("Growth handler requires an environment reader");
  }

  const supabaseUrl = (env.get("SUPABASE_URL") || "").replace(/\/+$/, "");
  const publishableKey = readKey(env, "SUPABASE_PUBLISHABLE_KEYS", "SUPABASE_ANON_KEY");

  async function callAuth(userJwt) {
    if (!supabaseUrl || !publishableKey) {
      throw new GrowthRequestError(503, "server_configuration_missing");
    }
    const response = await fetchImpl(supabaseUrl + "/auth/v1/user", {
      method: "GET",
      headers: {
        apikey: publishableKey,
        authorization: userJwt,
        accept: "application/json",
      },
    });
    if (!response.ok) throw new GrowthRequestError(401, "invalid_session");
    const user = await response.json();
    if (!user || typeof user.id !== "string" || !user.id) {
      throw new GrowthRequestError(401, "invalid_session");
    }
    return user;
  }

  function privilegedKey() {
    const value = readKey(env, "SUPABASE_SECRET_KEYS", "SUPABASE_SERVICE_ROLE_KEY");
    if (!value) throw new GrowthRequestError(503, "server_configuration_missing");
    return value;
  }

  async function dbRequest(path: string, { method = "GET", body, prefer = "" }: { method?: string; body?: unknown; prefer?: string } = {}) {
    const key = privilegedKey();
    const headers = new Headers({
      apikey: key,
      authorization: "Bearer " + key,
      accept: "application/json",
    });
    if (body !== undefined) headers.set("content-type", "application/json");
    if (prefer) headers.set("prefer", prefer);
    const response = await fetchImpl(supabaseUrl + "/rest/v1/" + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    const data = parseDbResponse(text);
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new GrowthRequestError(503, "server_database_configuration");
      }
      if (response.status === 404) throw new GrowthRequestError(404, "record_not_found");
      if (response.status === 409) throw new GrowthRequestError(409, "duplicate_request");
      throw new GrowthRequestError(502, "database_operation_failed");
    }
    return data;
  }

  // The CEO check is anchored to the existing public.perfis authorization model.
  async function authorize(request: Request) {
    const authorization = request.headers.get("authorization") || "";
    if (!/^Bearer\s+\S+$/i.test(authorization)) {
      throw new GrowthRequestError(401, "missing_session");
    }

    const user = await callAuth(authorization);
    const ceoId = env.get("PLACURSO_GROWTH_CEO_USER_ID") || "";
    if (!ceoId) throw new GrowthRequestError(503, "ceo_not_configured");
    if (user.id !== ceoId) throw new GrowthRequestError(403, "forbidden");

    const profile = await dbRequest(
      "perfis?select=id%2Cpapel&id=eq." + encodeURIComponent(user.id) + "&limit=1",
    );
    const row = Array.isArray(profile) ? profile[0] : null;
    if (!row || row.id !== user.id || row.papel !== "admin") {
      throw new GrowthRequestError(403, "forbidden");
    }
    return { user, id: user.id };
  }

  async function auditStart(actorId, requestId, action, objectType) {
    const rows = await dbRequest("growth_audit_log", {
      method: "POST",
      prefer: "return=representation",
      body: [{
        request_id: requestId,
        actor_id: actorId,
        action,
        object_type: objectType,
        outcome: "started",
        details: {},
      }],
    });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row || !row.id) throw new GrowthRequestError(502, "audit_write_failed");
    return row.id;
  }

  async function auditFinish(auditId, outcome, objectId = null) {
    await dbRequest(
      "growth_audit_log?id=eq." + encodeURIComponent(auditId),
      {
        method: "PATCH",
        prefer: "return=minimal",
        body: {
          outcome,
          object_id: objectId,
          completed_at: new Date().toISOString(),
        },
      },
    );
  }

  async function auditedMutation(actorId, requestId, action, objectType, operation) {
    const auditId = await auditStart(actorId, requestId, action, objectType);
    try {
      const data = await operation();
      const objectId = data && typeof data.id === "string" ? data.id : null;
      await auditFinish(auditId, "success", objectId);
      return data;
    } catch (error) {
      try {
        await auditFinish(auditId, "failed");
      } catch {
        // Keep the original operation error; never leak database response bodies.
      }
      throw error;
    }
  }

  async function listRows(table, actorId, select) {
    const query = table + "?select=" + encodeURIComponent(select)
      + "&created_by=eq." + encodeURIComponent(actorId)
      + "&order=created_at.desc&limit=100";
    const rows = await dbRequest(query);
    return Array.isArray(rows) ? rows : [];
  }

  async function handleOperation(actor, body) {
    const operation = normalizeText(body.operation, 80);
    const payload = body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)
      ? body.payload : {};

    if (operation === "account.list") {
      const rows = await dbRequest(
        "growth_accounts?select=id%2Cplatform%2Cexternal_account_id%2Cdisplay_name%2Caccount_type%2Cconnection_state%2Ccapabilities%2Ccreated_at&order=created_at.desc&limit=100",
      );
      return { status: 200, data: Array.isArray(rows) ? rows : [] };
    }

    if (operation === "campaign.list") {
      return {
        status: 200,
        data: await listRows(
          "growth_campaigns",
          actor.id,
          "id,name,objective,audience,offer,budget_limit,currency,status,created_at,updated_at",
        ),
      };
    }

    if (operation === "content.list") {
      return {
        status: 200,
        data: await listRows(
          "growth_contents",
          actor.id,
          "id,campaign_id,platform,format,body,asset_refs,version,content_hash,status,created_at,updated_at",
        ),
      };
    }

    if (operation === "audit.list") {
      const rows = await dbRequest(
        "growth_audit_log?select=id,request_id,action,object_type,object_id,outcome,created_at,completed_at&actor_id=eq."
        + encodeURIComponent(actor.id) + "&order=created_at.desc&limit=100",
      );
      return { status: 200, data: Array.isArray(rows) ? rows : [] };
    }

    if (operation === "campaign.create") {
      const requestId = body.requestId;
      const name = normalizeText(payload.name, 120);
      const objective = normalizeText(payload.objective, 40);
      const audience = normalizeText(payload.audience, 600);
      const offer = normalizeText(payload.offer, 600);
      const budget = Number(payload.budgetLimit);
      const currency = normalizeText(payload.currency || "AOA", 3).toUpperCase();
      if (!validateRequestId(requestId) || !name
        || !ALLOWED_OBJECTIVES.includes(objective)
        || !Number.isFinite(budget) || budget < 0
        || !CURRENCY_PATTERN.test(currency)) {
        throw new GrowthRequestError(400, "invalid_campaign");
      }
      const data = await auditedMutation(actor.id, requestId, "campaign.create", "campaign", async () => {
        const rows = await dbRequest("growth_campaigns", {
          method: "POST",
          prefer: "return=representation",
          body: [{
            created_by: actor.id,
            name,
            objective,
            audience,
            offer,
            budget_limit: budget,
            currency,
            status: "draft",
          }],
        });
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row) throw new GrowthRequestError(502, "campaign_create_failed");
        return row;
      });
      return { status: 201, data };
    }

    if (operation === "content.create") {
      const requestId = body.requestId;
      const platform = normalizeText(payload.platform, 24).toLowerCase();
      const format = normalizeText(payload.format, 24).toLowerCase();
      const text = normalizeText(payload.body, MAX_TEXT_LENGTH);
      const assets = Array.isArray(payload.assetRefs) ? payload.assetRefs.slice(0, 12) : [];
      const campaignId = normalizeText(payload.campaignId, 80);
      if (!validateRequestId(requestId) || !ALLOWED_PLATFORMS.includes(platform)
        || !ALLOWED_FORMATS.includes(format) || (!text && assets.length === 0)) {
        throw new GrowthRequestError(400, "invalid_content");
      }
      const canonical = JSON.stringify({ platform, format, body: text, assetRefs: assets });
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
      const contentHash = Array.from(new Uint8Array(digest))
        .map((value) => value.toString(16).padStart(2, "0")).join("");
      const data = await auditedMutation(actor.id, requestId, "content.create", "content", async () => {
        const rows = await dbRequest("growth_contents", {
          method: "POST",
          prefer: "return=representation",
          body: [{
            created_by: actor.id,
            campaign_id: campaignId || null,
            platform,
            format,
            body: text,
            asset_refs: assets,
            version: 1,
            content_hash: contentHash,
            status: "draft",
          }],
        });
        const row = Array.isArray(rows) ? rows[0] : null;
        if (!row) throw new GrowthRequestError(502, "content_create_failed");
        return row;
      });
      return { status: 201, data };
    }

    if (operation === "content.submit") {
      const requestId = body.requestId;
      const contentId = normalizeText(payload.contentId, 80);
      if (!validateRequestId(requestId) || !contentId) {
        throw new GrowthRequestError(400, "invalid_content_submission");
      }
      const data = await auditedMutation(actor.id, requestId, "content.submit", "content", async () => {
        const current = await dbRequest(
          "growth_contents?select=id%2Cstatus%2Ccreated_by&id=eq." + encodeURIComponent(contentId)
            + "&limit=1",
        );
        const row = Array.isArray(current) ? current[0] : null;
        if (!row || row.created_by !== actor.id) throw new GrowthRequestError(404, "record_not_found");
        if (row.status !== "draft") throw new GrowthRequestError(409, "invalid_content_state");
        const updated = await dbRequest(
          "growth_contents?id=eq." + encodeURIComponent(contentId) + "&created_by=eq." + encodeURIComponent(actor.id) + "&status=eq.draft",
          {
            method: "PATCH",
            prefer: "return=representation",
            body: { status: "pending_approval", updated_at: new Date().toISOString() },
          },
        );
        const next = Array.isArray(updated) ? updated[0] : null;
        if (!next) throw new GrowthRequestError(409, "content_submit_conflict");
        return next;
      });
      return { status: 200, data };
    }

    if (operation === "approval.decide") {
      const requestId = body.requestId;
      const contentId = normalizeText(payload.contentId, 80);
      const version = Number(payload.version);
      const suppliedHash = normalizeText(payload.contentHash, 64).toLowerCase();
      const decision = normalizeText(payload.decision, 16).toLowerCase();
      const reason = normalizeText(payload.reason, 500);
      if (!validateRequestId(requestId) || !contentId || !Number.isInteger(version)
        || version < 1 || !/^[a-f0-9]{64}$/.test(suppliedHash)
        || !["approved", "rejected"].includes(decision)) {
        throw new GrowthRequestError(400, "invalid_approval");
      }
      const data = await auditedMutation(actor.id, requestId, "approval.decide", "content", async () => {
        const current = await dbRequest(
          "growth_contents?select=id%2Ccreated_by%2Cstatus%2Cversion%2Ccontent_hash&id=eq."
            + encodeURIComponent(contentId) + "&limit=1",
        );
        const row = Array.isArray(current) ? current[0] : null;
        if (!row) throw new GrowthRequestError(404, "record_not_found");
        if (row.status !== "pending_approval" || row.version !== version || row.content_hash !== suppliedHash) {
          throw new GrowthRequestError(409, "stale_content_version");
        }
        const result = await dbRequest("rpc/growth_decide_approval", {
          method: "POST",
          prefer: "return=representation",
          body: {
            p_content_id: contentId,
            p_content_version: version,
            p_content_hash: suppliedHash,
            p_decision: decision,
            p_actor_id: actor.id,
            p_reason: reason,
          },
        });
        if (!result || !result.content || !result.approval_id) {
          throw new GrowthRequestError(409, "approval_conflict");
        }
        return result.content;
      });
      return { status: 200, data };
    }

    throw new GrowthRequestError(400, "unknown_operation");
  }

  return async function handle(request: Request): Promise<Response> {
    const origin = request.headers.get("origin") || "";
    if (request.method === "OPTIONS") return jsonResponse(204, {}, origin);
    if (request.method !== "POST") return failure(405, "method_not_allowed", origin);
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return failure(415, "unsupported_media_type", origin);
    }

    const parsed = await readRequestBody(request);
    if (!parsed.ok) return failure(parsed.status, parsed.code, origin);

    try {
      const actor = await authorize(request);
      const result = await handleOperation(actor, parsed.value);
      return jsonResponse(result.status, { ok: true, data: result.data }, origin);
    } catch (error) {
      if (error instanceof GrowthRequestError) return failure(error.status, error.code, origin);
      return failure(500, "internal_error", origin);
    }
  };
}

if (import.meta.main) {
  Deno.serve(createGrowthHandler({ env: Deno.env, fetchImpl: fetch }));
}
