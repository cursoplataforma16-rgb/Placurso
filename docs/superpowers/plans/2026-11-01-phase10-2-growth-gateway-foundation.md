# Phase 10.2 — Growth Gateway Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secure, testable growth-management capability to the existing ANNAN runtime so the CEO can manage social accounts, campaigns, content drafts and approvals without exposing credentials or publishing before authorization.

**Architecture:** Reuse `PlacursoAnnanIntegrationGateway`, `PlacursoAnnanExecutionEngine` and the current Supabase project. Add a dedicated authenticated Supabase Edge Function named `annan-growth`, protected growth tables, and a thin browser adapter for the existing Growth Center. This first phase handles account metadata, campaigns, drafts, approvals and audit only; no provider OAuth, external publishing, metrics ingestion or advertising spend is activated.

**Tech Stack:** Existing static site and Netlify build; JavaScript browser modules; Supabase Auth, PostgreSQL RLS and Edge Functions (Deno/TypeScript); Python and Node contract tests; GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-01-phase10-2-audience-growth-engine-design.md`

## Global Constraints

- Keep a single central ANNAN; the Growth Engine is an ANNAN capability, not a second intelligence engine.
- Keep the existing `annan-ensino` function dedicated to teaching; create `annan-growth` separately.
- Keep the current static site, Netlify build pipeline, current Supabase project and student learning experience.
- Never put service-role keys, provider secrets, OAuth tokens or encryption keys in browser code, public HTML, logs or Git.
- `annan-growth` requires a valid user JWT and an additional server-side CEO authorization check; do not trust browser state, localStorage or `user_metadata`.
- The current `public.perfis` table has zero rows. No admin mutation can be enabled until the real CEO Auth user is identified and explicitly provisioned in the existing authorization model.
- Enable RLS on every new table; revoke direct `anon` and `authenticated` access to sensitive growth records. Only the server function uses privileged database access.
- A content approval is bound to an immutable content version; any edit after approval invalidates that approval.
- This phase must not send requests to social platforms, publish posts, schedule posts, message users or spend advertising budget.
- Empty, pending, disconnected or unmeasured states must remain explicit. Never generate fake connected accounts, follower counts, reach, clicks, sales or revenue.
- Preserve the existing ANNAN modules, A-Ads unit 2459988, student authentication/session and offline learning behavior.
- Use official Supabase documentation and verify current API behavior before implementation. The latest changelog check on 2026-11-01 showed relevant breaking updates for TLS 1.2 ciphers planned for 2026-11-10 and a Postgres minor upgrade affecting legacy pgcrypto ciphertext; do not introduce a pgcrypto-based token scheme without reviewing that notice.

## Review Focus

1. **Missing CEO identity / no admin profile:** return a clear `ceo_not_configured` result and deny mutations; never fall back to public access. Test the missing profile and unset CEO ID.
2. **Expired, malformed or wrong-project JWT:** reject before any privileged query or mutation. Test unauthenticated and invalid-token requests.
3. **Content edited after approval:** approval must no longer authorize the changed version. Test version/hash mismatch.
4. **Duplicate approval or repeated request:** use stable request/idempotency identifiers and prevent duplicate approvals/audit events. Test replay.
5. **Invalid or misleading metrics / account state:** accept only explicitly sourced provider records later; in this phase return disconnected/unmeasured states and reject client-supplied KPI values.

---

### Task 1: Define failing contracts for the growth service

**Files:**
- Create: `scripts/test_annan_growth_contract.py`
- Create: `supabase/functions/annan-growth/index_test.ts`
- Create: `scripts/test_phase10_2_build_integration.py`
- Test: existing `scripts/test_phase8_integration_gateway.py`
- Test: existing `scripts/test_phase9_2_build_integration.py`
- Test: existing `scripts/test_phase9_3_build_integration.py`

**Interfaces:**
- Contract will define operations: `account.list`, `campaign.list`, `campaign.create`, `content.list`, `content.create`, `content.submit`, `approval.decide`, and `audit.list`.
- Every mutation accepts a client-generated request ID for replay protection and returns a normalized result with `ok`, `data` or a stable error code.
- No publishing or external provider operations are part of this contract.

- [ ] **Step 1: Write failing tests** for the operation allowlist, server-only privileged credentials, JWT enforcement, CEO authorization, approval version binding, audit logging, and explicit no-publish scope.
- [ ] **Step 2: Run the new tests** with `python scripts/test_annan_growth_contract.py` and `deno test --allow-net supabase/functions/annan-growth/index_test.ts`.
- [ ] Confirm the failures are caused by the missing service/contracts, not syntax or test setup.
- [ ] **Step 3: Commit the tests** before writing production code.

### Task 2: Create the protected growth data model

**Files:**
- Create through Supabase CLI: `supabase/migrations/<generated>_phase10_2_growth_foundation.sql`
- Test: `scripts/test_annan_growth_schema.py`
- Reference: `supabase/migrations/20261031175547_annan_privilege_hardening.sql`

**Interfaces:**
- `growth_accounts`: platform, external account ID, display name, account type, status, granted capability metadata and timestamps. No access token column in this first phase.
- `growth_campaigns`: objective, audience, offer, budget cap, currency, status, owner and timestamps.
- `growth_contents`: campaign ID, platform, format, body/caption, asset references, immutable version, content hash, status and timestamps.
- `growth_approvals`: content ID, approved version/hash, decision, decision actor, reason and timestamp.
- `growth_publications`: reserved publication record shape only; no public send operation or publisher adapter is implemented in this phase.
- `growth_metrics`: reserved source-aware metric record shape only; client input is not accepted as a metric source in this phase.
- `growth_audit_log`: actor ID, action, object type/ID, request ID, safe outcome metadata and timestamp; never store credentials or full sensitive provider responses.
- All tables use generated UUID primary keys, foreign keys, suitable unique/idempotency constraints and indexes for owner/status/date queries.

- [ ] **Step 1: Write a failing schema contract** that checks every required table, column family, unique constraint and status constraint.
- [ ] **Step 2: Run the schema contract** and confirm it fails because the Phase 10.2 objects are absent.
- [ ] **Step 3: Generate the migration using** `supabase migration new phase10_2_growth_foundation`; do not invent the timestamped filename.
- [ ] **Step 4: Implement the minimal schema** with RLS enabled on every new table, no policies that grant direct public access, and explicit revocation of `anon`, `public` and `authenticated` table privileges. Keep service-only database operations in the Edge Function.
- [ ] **Step 5: Apply the migration to the active project** only after reviewing the SQL diff and the actual CEO identity prerequisite. Use the active project `ebdrrsrvjsdjthatfbcd`; do not touch the old legacy project.
- [ ] **Step 6: Verify** the tables, constraints, RLS flags, grants and policies with read-only catalog queries and run Supabase security/performance advisors.
- [ ] **Step 7: Commit** the migration and schema test.

### Task 3: Implement the authenticated `annan-growth` Edge Function

**Files:**
- Create: `supabase/functions/annan-growth/index.ts`
- Create: `supabase/functions/annan-growth/deno.json` (only if needed by the selected imports/runtime)
- Test: `scripts/test_annan_growth_service.js`
- Test: `scripts/test_annan_growth_contract.py`

**Interfaces:**
- Request: JSON object containing `operation`, optional `requestId`, and operation-specific `payload`.
- Response: normalized JSON `{ ok: boolean, data?: object, error?: { code: string, message: string } }`.
- Operations: `account.list`, `campaign.list`, `campaign.create`, `content.list`, `content.create`, `content.submit`, `approval.decide`, `audit.list`.
- Auth: `verify_jwt = true`; function verifies the caller's user identity, then checks that the exact user ID matches the provisioned CEO identity and the existing `public.perfis.papel = 'admin'` record. If either is missing, deny writes with `ceo_not_configured` / `forbidden`.
- Database: privileged client exists only inside the function and only after authentication/authorization succeeds.
- The CEO ID is provided as a server secret `PLACURSO_GROWTH_CEO_USER_ID` after the actual Auth user is confirmed; do not infer it from an email or public user metadata.
- Do not accept caller-supplied `actorId`, role, account status, approval actor or KPI values as authority.

- [ ] **Step 1: Write tests first** for preflight auth rejection, admin/CEO mismatch, missing CEO configuration, valid CEO operation, invalid input, unknown operation, content creation/submission, version-bound approval, request replay and safe error serialization.
- [ ] **Step 2: Run tests and observe the expected RED failures.**
- [ ] **Step 3: Implement** the function with explicit method/content-type validation, payload size limits, allowlisted operations, strict field validation, safe error responses, server-side authorization and audit writes.
- [ ] **Step 4: Implement approval rules:** only the configured CEO can approve or reject; the approved version/hash must equal the current content version/hash; edits change the version and clear the effective approval state.
- [ ] **Step 5: Implement idempotency** for mutating operations using `requestId` and database uniqueness; identical replays return the original result or a stable duplicate result.
- [ ] **Step 6: Run Node/Deno tests** and verify that no service-role key or secret name/value is present in client files or logs.
- [ ] **Step 7: Commit** the function and tests.

### Task 4: Extend the current ANNAN integration boundary

**Files:**
- Modify: `scripts/annan_integration_gateway.js`
- Modify: `scripts/annan_execution_gateway_adapter.js` only if the test demonstrates an actual missing interface
- Test: existing `scripts/test_annan_integration_gateway.js`
- Test: existing `scripts/test_phase8_integration_gateway.py`
- Test: existing `scripts/test_annan_execution_gateway_adapter.js`

**Interfaces:**
- Register one integration named `placurso-growth`, kind `channel`, version `10.2`, with metadata only.
- The browser client checks the existing Gateway registry and dispatches a credential-free operation descriptor before invoking `annan-growth` through the existing Supabase session client; the browser Gateway itself must not make external network calls.
- Dispatch must not carry provider credentials, access tokens or unrestricted URLs.
- Do not add a second learning/decision engine or perform external provider HTTP requests from the browser-side Gateway.

- [ ] **Step 1: Add failing tests** proving the Gateway accepts safe growth metadata, rejects secret-like payloads, refuses unknown operations and keeps external network access out of the browser module.
- [ ] **Step 2: Run the tests and verify RED.**
- [ ] **Step 3: Add the smallest compatible integration registration/dispatch contract** while preserving existing API behavior for other integrations.
- [ ] **Step 4: Run all Phase 8/9 Gateway tests.**
- [ ] **Step 5: Commit.**

### Task 5: Connect the existing Growth Center to the server capability

**Files:**
- Modify: `scripts/placurso-growth-center.js`
- Modify: `scripts/patch_annan_growth_assets.py` only if needed to load the adapter
- Create: `scripts/annan_growth_client.js`
- Modify: `scripts/build_netlify.py` only to include the new browser client safely
- Test: `scripts/test_phase10_2_build_integration.py`

**Interfaces:**
- Browser client uses the existing Supabase Auth session through the existing Supabase client adapter; do not create a second independent login/session.
- Read operations call `annan-growth` with the current session JWT.
- CEO-only controls remain disabled and show a precise setup message while `PLACURSO_GROWTH_CEO_USER_ID` and the admin profile have not been provisioned.
- The UI supports account metadata view, campaign create/list, content draft create/list, submit for approval and approval decision.
- The UI shows provider channels as disconnected until a real OAuth flow is implemented in the provider adapter phases.
- KPI cards remain “—” until real metrics ingestion and source attribution exist.

- [ ] **Step 1: Write failing tests** for the browser client contract, no-secret boundary, no fake connection, no fake KPI, and build inclusion.
- [ ] **Step 2: Run the tests and verify RED.**
- [ ] **Step 3: Implement the client** using the current auth session; do not add API keys or service credentials to the browser.
- [ ] **Step 4: Connect UI actions** to the server contract and show controlled disabled/error/empty states.
- [ ] **Step 5: Build and test** that the Growth Center and existing ANNAN voice modules remain included exactly once.
- [ ] **Step 6: Commit.**

### Task 6: CI, security review and full regression

**Files:**
- Create: `.github/workflows/phase10-2-growth-gateway-verify.yml`
- Test: all Phase 10.2 tests above
- Test: ANNAN, authentication, A-Ads, Phase 4, Phase 6, Phase 7, Phase 8, Phase 9 and Phase 10.1 tests/workflows

- [ ] **Step 1: Add a PR workflow** for the 10.2 migration contract, function contract, browser integration, existing Gateway tests and full build checks.
- [ ] **Step 2: Run the full existing test suite** rather than only the new tests; record any unrelated pre-existing failure by exact name.
- [ ] **Step 3: Run the full Netlify build** and assert that the build output preserves ANNAN learning, voice, Product Factory, Integration Gateway, Execution Engine, Autonomous Workflow, A-Ads 2459988 and the Phase 10.1 assets.
- [ ] **Step 4: Inspect the final diff** for secret exposure, DIONUEL references in Placurso runtime surfaces, wrong project IDs, fake metrics, unapproved external calls and duplicate ANNAN integrations.
- [ ] **Step 5: Open a draft PR** to `main`; do not merge or deploy while CEO authorization remains unconfigured or any required check is failing.
- [ ] **Step 6: Verify GitHub Actions checks and the PR diff** before marking the foundation phase ready.

## Implementation boundary

The Phase 10.2 deliverable ends when the protected data model, authenticated server contract, CEO-gated draft/approval workflow, audit trail, and Growth Center integration are testable. OAuth, encryption/storage of provider tokens, platform-specific publication, webhooks, metrics ingestion, lead attribution, experiments and autonomous publishing belong to the later phases in the design document. This boundary prevents partially authorized external actions.
