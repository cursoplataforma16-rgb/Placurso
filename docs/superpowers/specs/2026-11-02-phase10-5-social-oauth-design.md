# Phase 10.5 — Social OAuth and provider integrations

**Date:** 2 November 2026  
**Status:** Design proposal — awaiting CEO approval  
**Scope:** Meta (Facebook Pages and Instagram Professional), WhatsApp Business, and YouTube.

## 1. Intent

Connect the Placurso CEO panel to the existing Facebook, Instagram, WhatsApp Business and YouTube applications through their official authorization flows. The existing ANNAN remains the single decision engine. The integration layer supplies authorized accounts, capabilities and real provider data; it is not a second agent.

Success means the CEO can connect and disconnect the intended accounts, see the real account identity and permission state, and let the existing ANNAN Growth service use only capabilities that the provider actually granted. It must not require sharing passwords or OAuth secrets in chat.

## 2. Current state verified

- The active Supabase project is `plataforma-curso` (`ebdrrsrvjsdjthatfbcd`).
- Supabase Edge Function `annan-growth` is active at version 5 with JWT verification enabled. It authenticates the Google CEO identity and currently supports account listing, campaigns, content drafts, approvals and audit operations; it explicitly does not yet perform OAuth or provider publishing.
- The public `growth_accounts` table contains account identity/state/capabilities, but no provider tokens. Growth tables are protected by RLS and service-side access.
- Supabase Vault (`supabase_vault`) is already installed at version 0.3.1. It can store per-account secrets encrypted at rest.
- Pull request #21 adds a first visual integration centre, but is still open and currently reports `mergeable=false` against an older base commit. It must not be merged as-is. Its UI work should be reviewed and rebased/rebuilt on the current `main`, retaining the production redirect-loop fix.
- The production CEO login is out of scope and must remain untouched.

## 3. Goals

1. Add official OAuth account linking for Facebook Pages and Instagram Professional.
2. Add WhatsApp Business onboarding using Meta's Embedded Signup flow, not a generic social-feed connector.
3. Add a separate Google OAuth flow for YouTube channel access.
4. Store provider app credentials as Supabase Edge Function secrets and per-account access/refresh tokens in Supabase Vault.
5. Show real account names, identifiers, granted capabilities, connection/expiry state and last successful synchronization in the CEO panel.
6. Reuse `annan-growth`, its existing Gateway route, audit trail and growth data model.
7. Enforce CEO authorization, least-privilege scopes, one-time OAuth state, expiry, revocation and idempotent callbacks.
8. Keep all publishing and paid-ad spending behind explicit CEO approval. A connected account alone never authorizes publication or spending.

## 4. Non-goals and guardrails

- No second ANNAN, no direct provider calls from public browser JavaScript, and no provider token or App Secret in HTML, browser storage, Git, logs, or chat.
- No likes/follows/comment automation, spam, unsolicited WhatsApp broadcasts, fake engagement, or promises of viral reach.
- WhatsApp is treated as a messaging and conversion channel, not as a feed.
- Paid advertising and campaign spend are a separate permission and approval path from organic publishing.
- Do not change Supabase Google login, CEO bootstrap, `annan-ensino`, existing learner flows, or production redirect routing.
- Never mark an account as connected based only on a callback redirect; verify the provider identity and granted capabilities server-side.

## 5. Approaches considered

### A. Browser-managed OAuth and provider API calls
Rejected. It exposes tokens to the client, fragments authorization and auditing, and makes secure refresh/revocation harder.

### B. External social-media aggregator
Not selected as the core. It may be considered later as an optional connector, but it introduces cost, vendor dependency and limits control over the ANNAN approval/audit cycle.

### C. Server-side OAuth and provider adapters behind the existing ANNAN Growth service
**Selected by the CEO.** The authenticated `annan-growth` function starts authorized operations. A separate OAuth callback function validates one-time state and exchanges provider codes. Secrets remain server-side; account tokens are kept encrypted in Vault; existing Growth tables remain the operational record.

## 6. Target architecture

```
CEO panel (existing Google CEO session)
        |
        | authenticated request: connect provider
        v
ANNAN Gateway -> annan-growth (verify_jwt=true)
        | creates one-time OAuth transaction
        v
Official provider authorization screen
        |
        | code + state (or Meta Embedded Signup result)
        v
annan-growth-oauth (public callback; verify_jwt=false)
        | validate + consume state, exchange code server-side
        | verify identity, granted scopes and provider account
        | store tokens in Supabase Vault
        v
private credential metadata <-> Vault encrypted secret records
        |
        v
growth_accounts -> ANNAN Growth -> approval -> provider adapter
        |
        v
real provider status, publications and metrics -> CEO panel
```

The callback endpoint is intentionally reachable without a Supabase user JWT because Meta/Google redirect the browser to it. It is not an open authorization endpoint: it accepts only a valid, unexpired, unused, provider-bound random state transaction created by an authenticated CEO request. The callback must consume that transaction atomically before exchanging the code. All management operations remain JWT-protected and CEO-authorized.

## 7. Authorization details

### Meta — Facebook Pages and Instagram Professional

Use the existing Meta application and a server-side authorization-code flow. Request only the permissions required for the capabilities being enabled. Initial read/discovery should be separated from publishing/comment-management permissions so the app does not request unnecessary access.

After exchange, discover the CEO-authorized Pages and the Instagram Professional accounts linked to those Pages. Do not treat a personal/consumer Instagram account as an eligible publishing account. Save each discovered Page and professional Instagram account as its own `growth_accounts` row, linked to the same underlying Meta authorization where appropriate.

Before production publishing, confirm Meta App Review/Advanced Access for every required permission and test the exact account type and content format.

### Meta — WhatsApp Business

Use Facebook Login for Business / WhatsApp Embedded Signup, with a distinct Meta configuration ID and the minimum WhatsApp permissions required for onboarding and messaging. The client may launch Meta's official embedded flow, but it must immediately send the one-time authorization result to the authenticated server flow. The server exchanges and verifies it, then records the WhatsApp Business Account and phone-number identifiers.

WhatsApp outbound messages require their own consent, template and policy checks. No bulk messaging is activated by simply connecting a number.

### Google — YouTube

Use a separate Google OAuth web-server flow, distinct from the Google login that authenticates the Placurso CEO. Request only the required YouTube scopes, initially read-only channel access and the upload/analytics scopes only when those features are enabled. Use offline access where a refresh token is needed and implement refresh/revocation securely.

After exchange, verify the selected channel and store its real channel ID and display name. Public-app OAuth verification and YouTube API quota constraints must be checked before enabling production uploads or analytics collection.

## 8. Server secrets and per-account token storage

Provider application credentials are static server configuration, stored as Supabase Edge Function secrets (never in Git or browser code):

- `META_APP_ID` and `META_APP_SECRET`
- `META_WHATSAPP_CONFIG_ID` (public configuration identifier; not a secret)
- `GOOGLE_YOUTUBE_CLIENT_ID` and `GOOGLE_YOUTUBE_CLIENT_SECRET`

The exact values will be supplied/configured only when the implementation is ready. No secret values are part of this design document.

Per-account access tokens, refresh tokens (where supplied), token type, expiry and granted scopes are stored as Vault secrets. A private metadata table stores only references to the Vault secret IDs and non-secret lifecycle metadata. An internal database interface will permit access only to the privileged server role; access to `vault.decrypted_secrets` must not be granted to `anon` or `authenticated`. Tokens are never returned by account-list APIs.

OAuth transactions live in a private, service-only table with provider, CEO user ID, state hash, expiry, consumed timestamp and PKCE verifier reference where applicable. State is random, single-use, short-lived (10 minutes), provider-bound and stored hashed. Use PKCE S256 where supported. Callback logs must exclude codes, state values, tokens and provider response bodies.

## 9. Data and API changes

Keep `growth_accounts` as the user-visible account index. Add private metadata for credentials and OAuth transactions; do not add plaintext token columns to `growth_accounts`.

Extend `annan-growth` with authenticated operations such as:

- `oauth.start` — create a one-time transaction and return the provider authorization URL.
- `account.list` — return safe account metadata, scopes/capabilities and status only.
- `account.disconnect` — revoke where supported, remove Vault secrets and mark the account revoked.
- `account.sync` — re-check provider identity, grants and expiry.

Add a dedicated `annan-growth-oauth` callback function for provider redirects and Meta Embedded Signup completion. It must validate state and provider identity, exchange codes using server secrets, persist tokens in Vault, upsert accounts idempotently and append audit records. It must never accept a user-supplied account ID as proof of authorization.

Provider adapters should expose capabilities explicitly (for example: profile_read, page_publish, instagram_publish, video_upload, metrics_read, whatsapp_message_send). Unsupported or unapproved capabilities remain disabled in the database and UI.

## 10. Rollout order

1. **Foundation:** rebase/rebuild the PR #21 integration-centre UI on current `main`; add the OAuth transaction/credential model and restricted Vault access.
2. **Meta Pages + Instagram:** connect, discover and verify real Page/professional account identities and grants.
3. **WhatsApp Embedded Signup:** connect WABA and phone number; validate webhook setup separately before messaging.
4. **YouTube:** connect the channel, verify read scopes, and enable upload/analytics only after required consent and API checks.
5. **Publishing and metrics:** add one provider adapter at a time, with CEO approval for the exact content version and idempotent publication records.
6. **Paid campaigns:** only after separate Marketing API permissions, explicit budget ceilings and an additional CEO approval.

## 11. Acceptance tests

- Unauthenticated or non-CEO users cannot start, complete, inspect, or disconnect CEO provider integrations.
- A callback with missing, modified, expired, replayed or mismatched state is rejected.
- A successful connection records only verified external accounts and only scopes actually granted.
- Duplicate callbacks do not create duplicate accounts or secret records.
- Account-list responses, browser assets and logs contain no tokens or secrets.
- Token refresh, expiry, revocation and disconnect are represented accurately.
- A disconnected, expired or revoked account cannot publish.
- Publishing cannot proceed without CEO approval for the exact content version; advertising spend requires a separate approved budget.
- Existing CEO Google login, learner experience, ANNAN engine, and the production `/cursos` route pass regression checks.

## 12. Remaining external inputs

Once the implementation is approved, collect only non-secret configuration identifiers in the conversation or UI (Meta App ID, Meta WhatsApp configuration ID, Google OAuth Client ID). App Secrets/Client Secrets must be entered directly into Supabase Edge Function Secrets. The provider dashboards must have the exact callback URI registered:

`https://ebdrrsrvjsdjthatfbcd.supabase.co/functions/v1/annan-growth-oauth`

The provider's App Review, business verification, phone-number eligibility, Google OAuth consent verification and API quotas remain external approval/dependency gates. They cannot be bypassed by application code.
