# SDD ledger — plan: docs/superpowers/plans/2026-11-02-google-ceo-login-repair.md

**Base:** `537b27414c3358e167f83485343a961963506943`  
**Reviewed code head:** `c16a1cd3f7a7abcb427b20cc795aed600d82d8e1`  
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
- Live inspection then found `public.handle_new_user()` still contained the former email and would create the new Google user as `aluno`, after which the anti-escalation trigger would block the service-side role change.
- Added and applied `20261101232653_ceo_signup_profile_from_identity`: the Auth-user creation trigger now reads `public.growth_ceo_identity`, and assigns `admin` only when the new Auth record matches the singleton email, has a confirmed email and Google provider metadata. Every other new Auth user receives `aluno`; existing profile rows are not overwritten (`ON CONFLICT DO NOTHING`).
- Verified the live function definition after applying the migration. The singleton still contains the new CEO email with null Auth UUID/claim fields pending the first interactive login; the former Auth profile is `aluno`.

### Task 4: Browser login — complete

- Updated `scripts/patch_annan_growth_assets.py`: the browser no longer contains either email as an allowlist. After a Google callback it verifies the Supabase user and invokes `ceo.bootstrap`.
- A positive server response displays CEO verification. HTTP 403 / `forbidden` continues to the standard student flow. Missing session and other service errors return to login with an error; they never grant CEO access.
- The first real production build exposed a second legacy browser-side `CEO_EMAILS` array that could promote email addresses without server authorization. Added `_disable_legacy_browser_ceo_allowlist()` to the generator; it removes the old promotional comment and empties `CEO_EMAILS`, failing closed if the expected source block cannot be found.
- Added `scripts/test_ceo_login_build_output.py` and a CI step to run the exact production build commands, then verify generated `public/index.html` and `public/sw.js`. Latest build reports `Generated CEO login asset verification: PASS`; both old and new CEO email strings are absent from browser HTML.

### Task 5: Deployment — in progress

- Complete: latest Growth Gateway CI and all six other project workflows passed at code head `c16a1cd3f7a7abcb427b20cc795aed600d82d8e1`; Deno test output was `9 passed | 0 failed`; generated Netlify asset test passed.
- Complete: `annan-growth` version 3 is ACTIVE with `verify_jwt = true`.
- Complete: Netlify Deploy Preview for PR #19 is READY at `https://deploy-preview-19--placurso.netlify.app`, using code head `c16a1cd3f7a7abcb427b20cc795aed600d82d8e1`; deploy ID `6ae7cae59b3d71d940f94899`.
- Pending: merge PR #19 to trigger the production Netlify deployment; inspect the resulting production deploy.
- Pending: first interactive Google login with `belcianycosmedionisio@gmail.com`. The new account does not yet exist in `auth.users`; the first successful OAuth login will create/confirm that Auth identity and atomically claim the CEO singleton. This remains the only way to prove the full browser-to-Google-to-Auth login end to end.

## Rulings I made

1. **Repository workflow:** Used a dedicated GitHub branch and pull-request CI rather than a local git worktree because the repository checkout and local toolchain were not available in this session. Cost if wrong: slower feedback than local execution; mitigated by running the full relevant GitHub Actions workflows before merge.
2. **Existing anti-escalation trigger:** Used a transaction-local subject claim to allow the former CEO's own profile to be demoted by the migration, without disabling or replacing the protection. The migration has been applied and live state independently verified.
3. **Build verification:** Added a production build step to the Growth Gateway workflow because the earlier build-integration test only inspected source contracts and did not execute the actual Netlify generation command. This caught the old browser-side email promotion array; the generator now removes it and the production build test verifies its removal.
4. **Auth-user signup provisioning:** Replaced the signup trigger's hardcoded email comparison with a check against the CEO singleton plus confirmed Google provider metadata. This is required because `on_auth_user_created` creates `public.perfis` before `ceo.bootstrap` runs; without it, the new CEO would first receive `aluno` and the protected role-change trigger would reject the later promotion.
5. **Final review:** No independent review subagent was available through the connected tools. I reviewed the changed login generator, Edge Function authorization, both SQL migrations, regression tests and CI output directly. The seven project workflows are green.
