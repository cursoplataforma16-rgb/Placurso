# SDD ledger — plan: docs/superpowers/plans/2026-11-02-google-ceo-login-repair.md

**Base:** `537b27414c3358e167f83485343a961963506943`  
**Branch:** `feature/2026-11-02-ceo-google-login-repair`  
**Pull request:** #19  
**Supabase project:** `plataforma-curso` (`ebdrrsrvjsdjthatfbcd`)  
**Execution:** inline, through GitHub/Supabase connected actions. No local repository checkout was available in this session.

## Pre-flight

Task 1 produces the identity and browser behavior assertions consumed by Task 2 (Edge Function) and Task 4 (generated browser login). Their shared contract remains `ceo.bootstrap`: the server returns `data.role = admin` only for the singleton's confirmed Google email; a non-CEO identity returns HTTP 403 with `forbidden`. The existing Supabase session and student flow remain the same.

## Task results

### Task 1: Regression tests — complete

- Added browser contract assertions for server-delegated CEO classification, positive server-only CEO success, and the expected non-CEO 403 path.
- Updated Edge Function fixtures so the singleton and CEO Auth user use `belcianycosmedionisio@gmail.com`; the previous email is the negative case. Added non-Google and unconfirmed-email rejection cases.
- Observed the expected RED result in the initial CI run: Phase 10.3 CEO Google Auth contract failed against the old hardcoded identity.
- GREEN evidence: CI run `41361561174` executed the CEO contract, all 9 Edge Function tests, schema checks, Growth Center contract and ANNAN/Phase 8/9 checks successfully.

### Task 2: Server authorization — complete

- Removed the fixed email from `isConfirmedGoogleIdentity`. It now checks confirmed email plus Google provider metadata; `bootstrapCeo` and `authorize` compare the normalized Auth email against `growth_ceo_identity.email` and the claimed Auth UUID.
- Kept Edge Function JWT verification enabled.
- Deployed `annan-growth` version 3. It is ACTIVE and `verify_jwt = true`.

### Task 3: Supabase identity migration — complete

- The first migration attempt was rejected atomically by the existing `trg_bloquear_papel` trigger, which only permits role changes when `public.eh_admin()` succeeds. No data was changed by that rejected attempt.
- **Ruling:** In the migration transaction only, set `request.jwt.claim.sub` to the previous Auth UUID read from the locked CEO singleton row. This lets the existing trigger verify the currently linked admin identity for its own demotion. The trigger/function/policies were not disabled or changed. Cost if wrong: an incorrect local subject could authorize the wrong role transition; the migration asserts the old singleton email and requires exactly one matching admin profile before it updates the singleton.
- Applied migration `20261101231900_ceo_google_login_repair`.
- Verified live state: singleton email is `belcianycosmedionisio@gmail.com`; `auth_user_id` and `claimed_at` are NULL pending first Google login; old Auth UUID profile is `aluno`; query for all `papel = 'admin'` profiles returned no rows. The old Auth user and its other data were not deleted.
- Added the exact applied SQL as `supabase/migrations/20261101231900_ceo_google_login_repair.sql`.

### Task 4: Browser login — implementation complete; generated-build check in progress

- Updated `scripts/patch_annan_growth_assets.py`: the browser no longer contains either email as an allowlist. After a Google callback it verifies the Supabase user and invokes `ceo.bootstrap`.
- A positive server response displays CEO verification. HTTP 403 / `forbidden` continues to the standard student flow. Missing session and other service errors return to login with an error; they never grant CEO access.
- Added `scripts/test_ceo_login_build_output.py` and a CI step to run the same four commands configured in `netlify.toml`, then verify generated `public/index.html` and `public/sw.js`. Awaiting the latest CI result before marking the generated-artifact check complete.

### Task 5: Deployment — in progress

- Complete: Growth Gateway CI, server Edge Function v3 active with JWT verification enabled.
- Pending: merge PR #19 to trigger the existing Netlify deployment; inspect the resulting deploy and the published site.
- Pending: first interactive Google login with `belcianycosmedionisio@gmail.com`. The new account does not yet exist in `auth.users`; the first successful OAuth login will create/confirm that Auth identity and atomically claim the CEO singleton.

## Rulings I made

1. **Repository workflow:** Used a dedicated GitHub branch and pull-request CI rather than a local git worktree because the repository checkout and local toolchain were not available in this session. Cost if wrong: slower feedback than local execution; mitigated by running the full relevant GitHub Actions workflows before merge.
2. **Existing anti-escalation trigger:** Used a transaction-local subject claim to allow the former CEO's own profile to be demoted by the migration, without disabling or replacing the protection. The migration has been applied and live state independently verified.
3. **Build verification:** Added a production build step to the Growth Gateway workflow because the earlier build-integration test only inspected source contracts and did not execute the actual Netlify generation command. This adds CI time but catches a generated-site failure before merge.
