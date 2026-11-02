# Fase 10.5 — Ligações OAuth sociais — desenho técnico

## Intenção

Permitir que o CEO associe as contas oficiais de Facebook Pages, Instagram profissional, WhatsApp Business e YouTube ao Placurso. O ANNAN continua a ser o único motor de inteligência e o painel CEO continua a ser a autoridade para aprovar qualquer publicação ou despesa.

## Estado actual

- O login de gestão usa Google e está operacional; não deve ser alterado.
- `annan-growth` valida o JWT do utilizador, a identidade singleton do CEO e o perfil admin.
- `growth_accounts` já existe e é acessível apenas pelo serviço de servidor.
- O Centro de Crescimento prepara campanhas e conteúdos, mas ainda não tem OAuth, tokens, publicação ou métricas externas.
- A alteração antiga PR #21 é baseada num commit anterior à correcção de produção; esta fase será reconstruída sobre a versão actual de `main`.

## Abordagens

1. OAuth inteiramente no browser — rejeitada porque expõe códigos/tokens e dificulta auditoria.
2. Agregador externo — não escolhido como arquitectura base, por introduzir dependência/custo e afastar a autorização do ANNAN.
3. **OAuth no servidor Supabase, escolhido:** uma Edge Function dedicada trata início, callback e Embedded Signup; valida JWT/CEO antes de iniciar; valida state de utilização única no callback; troca códigos no servidor; cifra tokens com AES-GCM; guarda credenciais em tabela sem acesso directo de `anon` ou `authenticated`.

## Fluxos

- **Facebook Pages + Instagram profissional:** Facebook Login / Authorization Code, permissões seleccionadas para páginas e contas Instagram profissionais associadas. A callback descobre as páginas elegíveis e as contas Instagram profissionais ligadas.
- **YouTube:** Google OAuth de servidor, Authorization Code + PKCE, acesso offline para refresh token, consulta do canal autenticado.
- **WhatsApp Business:** Meta Embedded Signup (Facebook Login for Business). A interface lança a configuração oficial; a callback autenticada recebe code, WABA ID e phone number ID e conclui a troca no servidor. Não reutilizar o login Meta normal como substituto do Embedded Signup.
- **TikTok e X:** fora desta entrega.

## Segurança

- A função social será publicada com `verify_jwt=false` somente porque o callback externo não envia JWT. Todas as operações iniciadas pelo painel validam manualmente o JWT Supabase, identidade CEO, email/provider e `perfis.papel=admin`.
- A callback só aceita códigos associados a um `state_hash` existente, não expirado, não utilizado e ligado ao provider esperado. A linha é consumida antes da troca do código.
- O browser recebe apenas URLs de autorização, IDs públicos e estado de conexão; nunca recebe tokens, client secrets ou a chave de cifra.
- Tokens são cifrados com AES-256-GCM, IV aleatório, AAD ligada ao provider e ID da conta. A chave de 32 bytes fica exclusivamente nos secrets da Edge Function.
- Tabelas OAuth terão RLS activo e privilégios directos revogados a `public`, `anon` e `authenticated`; apenas `service_role` poderá ler/escrever.
- Não publicar, enviar mensagens, criar anúncios ou gastar orçamento nesta fase.
- Não alterar `annan-ensino`, a função `annan-growth` existente, nem o fluxo de login Google.

## Configuração necessária fora do código

Secrets da função `annan-social-oauth`:
- `META_APP_ID`
- `META_APP_SECRET`
- `META_GRAPH_API_VERSION` (usar `v26.0` como valor inicial configurável)
- `META_EMBEDDED_SIGNUP_CONFIG_ID`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `SOCIAL_OAUTH_ENCRYPTION_KEY` (32 bytes aleatórios codificados em base64)

Redirect URI a registar na aplicação Meta e no OAuth client Google:
`https://ebdrrsrvjsdjthatfbcd.supabase.co/functions/v1/annan-social-oauth`

O Facebook Login for Business/Embedded Signup precisa ainda da configuração WhatsApp apropriada e permissões avançadas aprovadas pela Meta. O Google pode exigir verificação OAuth para scopes sensíveis/restritos.

## Critérios de aceitação

1. Sem sessão ou com identidade diferente do CEO, nenhuma autorização pode começar.
2. State tem validade curta, hash guardado no servidor, provider correspondente e utilização única.
3. YouTube usa PKCE e pede acesso offline; tokens nunca aparecem na resposta.
4. Meta troca código no servidor e regista apenas páginas/contas profissionais elegíveis.
5. WhatsApp usa Embedded Signup e valida os IDs de WABA/telefone antes de guardar a conta.
6. Tokens são cifrados AES-GCM; sem a chave de cifra, a ligação falha de forma fechada.
7. Desligar uma conta revoga o estado e remove a credencial cifrada.
8. UI mostra estado real de cada conta e não afirma que está ligada antes da validação do servidor.
9. Testes Deno cobrem autenticação, state, PKCE, cifras, callbacks, ausência de segredos e desconexão.
10. Nenhum endpoint de publicação/anúncios é activado nesta entrega.

## Decisões reservadas para depois

- Adaptadores de publicação e recolha de métricas serão fases separadas, depois de as aplicações terem acesso aprovado.
- Acesso de anúncios Meta/Marketing API será separado da permissão orgânica de páginas.
- Automatização de publicação exigirá aprovação de CEO por conteúdo/versão e trilho de auditoria.
