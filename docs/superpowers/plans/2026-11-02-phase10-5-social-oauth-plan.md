# Fase 10.5 — OAuth Social do ANNAN — Plano de implementação

> **For agentic workers:** Execute cada tarefa sequencialmente e valide antes de avançar. Não publicar no Supabase nem integrar em `main` até o PR ser revisto.

**Goal:** Ligar Facebook Pages, Instagram profissional, WhatsApp Business e YouTube ao Placurso através de autorizações OAuth seguras, mantendo ANNAN como motor único.

**Architecture:** Uma Edge Function `annan-social-oauth` aceita inícios autenticados e callbacks externos, valida o CEO, consome state de utilização única, troca códigos no servidor e cifra tokens com AES-256-GCM. O painel chama a função através do cliente Growth já existente; dados privados residem em tabelas server-only no Supabase.

**Tech Stack:** Supabase Edge Functions / Deno, Postgres, Supabase Auth, Web Crypto AES-GCM, Facebook Login for Business / WhatsApp Embedded Signup, Google OAuth 2.0.

**Spec:** `docs/superpowers/specs/2026-11-02-phase10-5-social-oauth-design.md`

## Global Constraints

- Preservar sem alterações `annan-ensino`, `annan-growth` e o login Google do CEO.
- `annan-social-oauth` usa `verify_jwt=false` apenas para permitir callback externo; validar manualmente JWT e autoridade do CEO em todas as rotas privadas.
- Tokens, client secrets e chave AES nunca entram no browser, logs ou respostas.
- A tabela de tokens e a tabela de estados são acessíveis apenas por `service_role`.
- Não publicar conteúdo, enviar mensagens ou gastar orçamento.
- Meta Graph API version configurável; valor inicial `v26.0`.
- Redirect URI única: `https://ebdrrsrvjsdjthatfbcd.supabase.co/functions/v1/annan-social-oauth`.

## Review Focus

- JWT ausente/inválido, CEO não provisionado ou perfil sem admin → 401/403/503 sem writes privilegiados.
- Callback com state desconhecido, expirado, usado ou provider incompatível → rejeitar sem chamar APIs externas.
- Google sem PKCE, refresh token ou redirect URI exacto → ligação não pode ficar marcada como concluída.
- Meta sem páginas/Instagram profissional ou sem permissões aprovadas → conta fica não ligada; não criar registos fictícios.
- WhatsApp sem Embedded Signup v4, config ID, WABA ID ou phone number ID verificado → rejeitar.
- Chave AES ausente/malformada ou de versão diferente → falhar fechado e não guardar tokens em texto simples.

---

### Task 1: Contrato de estado e credenciais privadas

**Files:**
- Create: `supabase/migrations/20261102100000_phase10_5_social_oauth.sql`
- Test: `scripts/test_phase10_5_social_oauth_schema.py`

**Interfaces:**
- `growth_oauth_states(state_hash, platform, created_by, code_verifier, expires_at, used_at)`
- `growth_oauth_credentials(account_id, encrypted_access_token, encrypted_refresh_token, token_expires_at, token_type, scopes, encryption_version)`

- [ ] Escrever o teste para exigir ambas as tabelas, RLS e revogação de privilégios directos.
- [ ] Executar o teste e confirmar que falha sem a migração.
- [ ] Criar tabelas com chaves estrangeiras, índices e constraints.
- [ ] Activar RLS; revogar privilégios de `public`, `anon`, `authenticated`; conceder apenas a `service_role`.
- [ ] Executar novamente o teste de contrato.

### Task 2: Edge Function OAuth

**Files:**
- Create: `supabase/functions/annan-social-oauth/index.ts`
- Test: `supabase/functions/annan-social-oauth/index_test.ts`

**Interfaces:**
- `POST { action: "start", provider: "meta" | "youtube" }` → `{ ok:true, data:{ authorizationUrl } }`
- `POST { action: "whatsapp.start" }` → `{ ok:true, data:{ appId, configId, state }`
- `POST { action: "whatsapp.complete", payload:{ code,wabaId,phoneNumberId,state } }`
- `POST { action: "disconnect", payload:{ accountId } }`
- `GET ?code=...&state=...` → callback; consome state, troca code, regista contas e redirecciona para `/ceo`.

- [ ] Escrever testes Deno primeiro para JWT, CEO/admin, state de utilização única, PKCE Google, ausência de tokens em respostas e falha sem chave AES.
- [ ] Executar testes para observar as falhas esperadas.
- [ ] Implementar autenticação manual, state hash e consumo atómico.
- [ ] Implementar OAuth Meta + descoberta de Pages/Instagram.
- [ ] Implementar Google OAuth Authorization Code + PKCE e descoberta do canal YouTube.
- [ ] Implementar início e conclusão do WhatsApp Embedded Signup.
- [ ] Cifrar tokens com AES-256-GCM e persistir apenas ciphertext.
- [ ] Implementar desconexão segura e auditoria.
- [ ] Executar toda a suite Deno.

### Task 3: Cliente Growth e painel CEO

**Files:**
- Modify: `scripts/annan_growth_client.js`
- Create: `scripts/patch_placurso_social_integrations.py`
- Create: `scripts/placurso_social_integrations.js`
- Modify: `scripts/build_netlify.py`
- Test: `scripts/test_phase10_5_social_oauth_build.py`

**Interfaces:**
- `PlacursoGrowthClient.startSocialOAuth(provider)`
- `PlacursoGrowthClient.startWhatsAppSignup()`
- `PlacursoGrowthClient.completeWhatsAppSignup(payload)`
- `PlacursoGrowthClient.disconnectSocialAccount(accountId)`

- [ ] Escrever testes de build para assegurar que o painel CEO carrega o módulo e que os botões usam o cliente Growth.
- [ ] Executar os testes para observar falhas antes da implementação.
- [ ] Adicionar métodos que invocam apenas a Edge Function autenticada.
- [ ] Mostrar Facebook, Instagram, WhatsApp e YouTube com estado real, ligar, reconectar e desligar.
- [ ] Implementar Facebook JS SDK para Embedded Signup, sem expor secrets.
- [ ] Actualizar a etapa de build para incluir o módulo e executar `node --check`.
- [ ] Executar testes Python e build Netlify.

### Task 4: Configuração e documentação

**Files:**
- Create: `docs/superpowers/plans/2026-11-02-phase10-5-social-oauth-setup.md`

- [ ] Documentar secrets, permissões mínimas, callback exacto e testes manuais.
- [ ] Explicar que a app Meta/Google pode exigir revisão, verificação empresarial e aprovação de scopes.
- [ ] Confirmar que nenhum token aparece em UI, log ou response.
- [ ] Abrir PR e manter alterações isoladas; não fazer merge nem deploy sem revisão.

