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
  PLACURSO_GROWTH_CEO_USER_ID: "ceo-user-1",
};

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

Deno.test("fails closed when the CEO identity has not been provisioned", async () => {
  const mock = makeFetch([{ body: { id: "some-user", email: "user@example.test" } }]);
  const env = { ...baseEnv };
  delete (env as Record<string, string>).PLACURSO_GROWTH_CEO_USER_ID;
  const handler = createGrowthHandler({ env: createEnv(env), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "campaign.list" }));
  const body = await response.json();
  if (response.status !== 503 || body.error?.code !== "ceo_not_configured") {
    throw new Error("missing CEO identity did not fail closed");
  }
  if (mock.calls() !== 1) throw new Error("function queried the database before CEO setup");
});

Deno.test("rejects users other than the configured CEO", async () => {
  const mock = makeFetch([{ body: { id: "other-user" } }]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "campaign.list" }));
  if (response.status !== 403) throw new Error(`expected 403, received ${response.status}`);
  if (mock.calls() !== 1) throw new Error("non-CEO reached privileged database access");
});

Deno.test("requires the configured CEO to have the existing admin profile", async () => {
  const mock = makeFetch([
    { body: { id: "ceo-user-1" } },
    { body: [] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "campaign.list" }));
  if (response.status !== 403) throw new Error(`expected 403, received ${response.status}`);
  if (!mock.requests[1]?.url.includes("/rest/v1/perfis")) {
    throw new Error("existing admin profile was not checked");
  }
});

Deno.test("rejects unknown operations", async () => {
  const mock = makeFetch([
    { body: { id: "ceo-user-1" } },
    { body: [{ id: "ceo-user-1", papel: "admin" }] },
  ]);
  const handler = createGrowthHandler({ env: createEnv(baseEnv), fetchImpl: mock.fetchImpl });
  const response = await handler(request({ operation: "publication.send" }));
  if (response.status !== 400) throw new Error(`expected 400, received ${response.status}`);
  if (mock.calls() !== 2) throw new Error("unknown operation caused a mutation");
});

Deno.test("creates a campaign only after user and CEO checks succeed", async () => {
  const mock = makeFetch([
    { body: { id: "ceo-user-1" } },
    { body: [{ id: "ceo-user-1", papel: "admin" }] },
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
