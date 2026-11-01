import { createGrowthHandler } from "./index.ts";

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

function request(body: unknown, authorization = "Bearer valid-user-jwt") {
  return new Request("https://edge.test/annan-growth", {
    method: "POST",
    headers: {
      authorization,
      "content-type": "application/json",
      apikey: "sb_publishable_test",
    },
    body: JSON.stringify(body),
  });
}

const baseEnv = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: "sb_publishable_test" }),
  SUPABASE_SECRET_KEYS: JSON.stringify({ default: "sb_secret_server_only" }),
};
const identity = { id: 1, email: "belcianycosmedionisio@gmail.com", auth_user_id: null };
const ceoUser = {
  id: "ceo-user-1",
  email: "belcianycosmedionisio@gmail.com",
  email_confirmed_at: "2026-11-01T10:00:00Z",
  app_metadata: { provider: "google", providers: ["google"] },
  user_metadata: { full_name: "CEO account" },
};
const adminProfile = [{ id: "ceo-user-1", papel: "admin" }];

Deno.test("rejects requests without a user JWT before making outbound calls", async () => {
  const mock = makeFetch([]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "campaign.list" }, ""));
  if (response.status !== 401) throw new Error(`expected 401, received ${response.status}`);
  if (mock.calls() !== 0) throw new Error("unauthenticated request made an outbound call");
});

Deno.test("rejects an invalid JWT before checking CEO permissions", async () => {
  const mock = makeFetch([{ status: 401, body: { message: "invalid token" } }]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "campaign.list" }));
  if (response.status !== 401) throw new Error(`expected 401, received ${response.status}`);
  if (mock.calls() !== 1) throw new Error("invalid JWT reached privileged database access");
  if (mock.requests.some((item) => item.url.includes("/rest/v1/"))) {
    throw new Error("invalid JWT reached the database");
  }
});

Deno.test("fails closed when the CEO identity singleton is not provisioned", async () => {
  const mock = makeFetch([
    { body: { id: "some-user", email: "user@example.test" } },
    { body: [] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "campaign.list" }));
  const body = await response.json();
  if (response.status !== 503 || body.error?.code !== "ceo_not_configured") {
    throw new Error("missing CEO identity did not fail closed");
  }
  if (mock.calls() !== 2) throw new Error("function queried extra data before CEO setup");
});

Deno.test("CEO bootstrap requires the exact email and Google provider from Auth metadata", async () => {
  const wrongEmail = makeFetch([
    { body: { ...ceoUser, email: "johnjunior.tchek@gmail.com" } },
    { body: [identity] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: wrongEmail.fetchImpl });
  const wrongEmailResponse = await handler(request({ operation: "ceo.bootstrap" }));
  if (wrongEmailResponse.status !== 403) throw new Error("wrong email was allowed to bootstrap");
  if (wrongEmail.requests.some((item) => item.method === "PATCH" || item.method === "POST")) {
    throw new Error("wrong email caused a privileged write");
  }

  const nonGoogle = makeFetch([
    { body: { ...ceoUser, app_metadata: { provider: "email", providers: ["email"] } } },
    { body: [identity] },
  ]);
  const secondHandler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: nonGoogle.fetchImpl });
  const nonGoogleResponse = await secondHandler(request({ operation: "ceo.bootstrap" }));
  if (nonGoogleResponse.status !== 403) throw new Error("non-Google provider was allowed to bootstrap");
  if (nonGoogle.requests.some((item) => item.method === "PATCH" || item.method === "POST")) {
    throw new Error("non-Google identity caused a privileged write");
  }

  const unconfirmed = makeFetch([
    { body: { ...ceoUser, email_confirmed_at: null, confirmed_at: null } },
    { body: [identity] },
  ]);
  const thirdHandler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: unconfirmed.fetchImpl });
  const unconfirmedResponse = await thirdHandler(request({ operation: "ceo.bootstrap" }));
  if (unconfirmedResponse.status !== 403) throw new Error("unconfirmed email was allowed to bootstrap");
  if (unconfirmed.requests.some((item) => item.method === "PATCH" || item.method === "POST")) {
    throw new Error("unconfirmed identity caused a privileged write");
  }
});

Deno.test("CEO bootstrap provisions the existing verified identity through the private SQL RPC", async () => {
  const mock = makeFetch([
    { body: ceoUser },
    { body: [{ ...identity, auth_user_id: ceoUser.id }] },
    { body: { id: ceoUser.id, email: identity.email, auth_user_id: ceoUser.id, papel: "admin" } },
    { body: [{ id: "audit-bootstrap-1" }] },
    { body: [{ id: "audit-bootstrap-1", outcome: "success" }] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "ceo.bootstrap" }));
  const body = await response.json();
  if (!response.ok || body.ok !== true || body.data?.role !== "admin"
    || body.data?.authUserId !== ceoUser.id) {
    throw new Error("verified CEO bootstrap did not return the expected admin identity");
  }
  const rpc = mock.requests.find((item) => item.method === "POST"
    && item.url.endsWith("/rest/v1/rpc/placurso_ceo_bootstrap_profile"));
  if (!rpc) throw new Error("CEO bootstrap did not use the private profile provisioning RPC");
  const rpcBody = JSON.parse(rpc.body);
  if (rpcBody.p_auth_user_id !== ceoUser.id) {
    throw new Error("CEO RPC did not receive the Auth UUID");
  }
  if (rpc.headers.get("authorization") !== "Bearer sb_secret_server_only") {
    throw new Error("CEO provisioning RPC was not called with the server-only key");
  }
  if (mock.requests.some((item) => item.url.includes("/rest/v1/perfis") && item.method !== "GET")) {
    throw new Error("CEO bootstrap tried to change the profile directly through PostgREST");
  }
  if (mock.requests.some((item) => item.method === "PATCH" && item.url.includes("growth_ceo_identity"))) {
    throw new Error("CEO singleton was claimed outside the atomic database RPC");
  }
});

Deno.test("CEO bootstrap supports the first claim through the atomic database RPC", async () => {
  const mock = makeFetch([
    { body: ceoUser },
    { body: [identity] },
    { body: { id: ceoUser.id, email: identity.email, auth_user_id: ceoUser.id, papel: "admin" } },
    { body: [{ id: "audit-bootstrap-first-1" }] },
    { body: [{ id: "audit-bootstrap-first-1", outcome: "success" }] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "ceo.bootstrap" }));
  const body = await response.json();
  if (!response.ok || body.data?.role !== "admin") {
    throw new Error("first CEO identity claim did not complete through the RPC");
  }
  const rpc = mock.requests.find((item) => item.url.endsWith("/rest/v1/rpc/placurso_ceo_bootstrap_profile"));
  if (!rpc) throw new Error("first CEO claim did not use the atomic database RPC");
});

Deno.test("CEO bootstrap cannot take over an identity already claimed by another Auth UUID", async () => {
  const mock = makeFetch([
    { body: ceoUser },
    { body: [{ ...identity, auth_user_id: "different-auth-user" }] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "ceo.bootstrap" }));
  if (response.status !== 403) throw new Error("claimed CEO identity was taken over");
  if (mock.requests.some((item) => item.method === "POST")) {
    throw new Error("profile or audit mutation happened after takeover rejection");
  }
});

Deno.test("normal Growth operations require both the claimed CEO UUID and admin profile", async () => {
  const mock = makeFetch([
    { body: ceoUser },
    { body: [{ id: 1, email: identity.email, auth_user_id: ceoUser.id }] },
    { body: adminProfile },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "publication.send" }));
  if (response.status !== 400) throw new Error(`expected unknown operation 400, received ${response.status}`);
  if (!mock.requests[1]?.url.includes("/rest/v1/growth_ceo_identity")) {
    throw new Error("normal authorization did not validate the claimed CEO identity");
  }
  if (!mock.requests[2]?.url.includes("/rest/v1/perfis")) {
    throw new Error("normal authorization did not validate the admin profile");
  }
});

Deno.test("creates a campaign only after Auth identity and admin checks succeed", async () => {
  const mock = makeFetch([
    { body: ceoUser },
    { body: [{ id: 1, email: identity.email, auth_user_id: ceoUser.id }] },
    { body: adminProfile },
    { body: [{ id: "audit-1", request_id: "request-1-0001" }] },
    { body: [{ id: "campaign-1", name: "Contabilidade prática", status: "draft" }] },
    { body: [{ id: "audit-1", outcome: "success" }] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({
    operation: "campaign.create",
    requestId: "request-1-0001",
    payload: {
      name: "Contabilidade prática",
      objective: "leads",
      audience: "Pequenos comerciantes em Angola",
      offer: "Curso de contabilidade prática",
      budgetLimit: 0,
      currency: "AOA",
    },
  }));
  const body = await response.json();
  if (!response.ok || body.data?.id !== "campaign-1") {
    throw new Error("authorized CEO campaign creation did not succeed");
  }
  if (!mock.requests.some((item) => item.url.includes("/rest/v1/growth_campaigns"))) {
    throw new Error("campaign was not persisted");
  }
  if (mock.requests.some((item) => item.body.includes("sb_secret_server_only"))) {
    throw new Error("server secret leaked into a request body");
  }
});

Deno.test("does not return secrets in errors or normal responses", async () => {
  const mock = makeFetch([{ status: 401, body: { message: "auth failed" } }]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "campaign.list" }));
  const text = await response.text();
  if (text.includes("sb_secret_server_only") || text.includes("valid-user-jwt")) {
    throw new Error("credential material leaked in response");
  }
});
