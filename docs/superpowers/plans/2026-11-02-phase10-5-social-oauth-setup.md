# Configuração externa — Fase 10.5 Social OAuth

Este documento é para concluir a configuração após a revisão do código. Não cole credenciais em issues, mensagens, screenshots, commits ou no browser.

## 1. Callback único do Supabase

Registar exactamente este URI nas aplicações Meta e Google:

\`https://ebdrrsrvjsdjthatfbcd.supabase.co/functions/v1/annan-social-oauth\`

O endereço de retorno da autenticação do CEO continua a ser o endereço já existente do Placurso. Não substituir nem misturar com este callback social.

## 2. Secrets da Edge Function

No Supabase Dashboard do projecto \`plataforma-curso\`:

1. Abrir **Edge Functions → Secrets** (ou **Project Settings → Edge Functions → Secrets**, consoante a versão do painel).
2. Criar as variáveis abaixo para a função \`annan-social-oauth\`.
3. Não criar estas variáveis no Netlify, no JavaScript do browser ou no GitHub.

| Variável | Valor |
|---|---|
| \`META_APP_ID\` | App ID público da aplicação Meta |
| \`META_APP_SECRET\` | App Secret da aplicação Meta |
| \`META_GRAPH_API_VERSION\` | \`v26.0\` |
| \`META_EMBEDDED_SIGNUP_CONFIG_ID\` | Config ID do Embedded Signup v4 |
| \`GOOGLE_OAUTH_CLIENT_ID\` | OAuth Client ID do tipo Web |
| \`GOOGLE_OAUTH_CLIENT_SECRET\` | OAuth Client Secret |
| \`SOCIAL_OAUTH_ENCRYPTION_KEY\` | 32 bytes aleatórios, codificados em Base64 |

A chave \`SOCIAL_OAUTH_ENCRYPTION_KEY\` tem de representar exactamente 32 bytes aleatórios. Gera-a com um gestor de palavras-passe ou gerador criptográfico de confiança que permita produzir bytes aleatórios e Base64. Não reutilizes uma palavra-passe, API key ou segredo de outra aplicação. Guarda uma cópia segura fora do repositório: perder esta chave impede a descodificação dos tokens já armazenados.

Não alterar as variáveis Supabase já existentes (\`SUPABASE_URL\`, \`SUPABASE_PUBLISHABLE_KEYS\`, \`SUPABASE_SECRET_KEYS\`).

## 3. Meta — Facebook Pages e Instagram profissional

No [Meta for Developers](https://developers.facebook.com/apps/):

1. Abrir a aplicação já existente.
2. Confirmar que o produto Facebook Login / Facebook Login for Business está configurado.
3. Em App Settings → Basic, incluir \`placurso.netlify.app\` nos domínios da aplicação e configurar o URL/site HTTPS.
4. Em Facebook Login → Settings, adicionar o callback Supabase à lista **Valid OAuth Redirect URIs**.
5. Confirmar permissões necessárias: \`pages_show_list\`, \`pages_read_engagement\`, \`pages_manage_posts\`, \`instagram_basic\`, \`instagram_content_publish\`, \`instagram_manage_comments\`, \`instagram_manage_insights\`.
6. Verificar a função/tarefa que a conta autorizadora tem em cada Página. A conta deve ter acesso à Página; o Instagram deve ser profissional e estar associado a uma Página Meta elegível.
7. Submeter as permissões para Advanced Access/App Review quando o Meta o exigir antes de utilizar contas que não sejam administradores ou testers da aplicação.

A ligação só regista as permissões que a Meta efectivamente devolver como \`granted\`. A UI não deve inferir publicação a partir de uma permissão apenas solicitada.

## 4. Meta — WhatsApp Business Embedded Signup v4

Na mesma aplicação Meta:

1. Adicionar/configurar WhatsApp e o fluxo **Facebook Login for Business / Embedded Signup**.
2. Criar a configuração de Embedded Signup **v4**, com onboarding de WhatsApp Business Account e selecção do número.
3. Copiar o Config ID para \`META_EMBEDDED_SIGNUP_CONFIG_ID\`.
4. Confirmar que a aplicação pode obter \`whatsapp_business_management\` e \`whatsapp_business_messaging\`; solicitar Advanced Access/App Review quando aplicável.
5. Adicionar \`https://placurso.netlify.app\` aos domínios autorizados para o SDK.
6. Testar com uma WABA e número de teste/negócio que a aplicação tenha autorização para gerir.

O fluxo da interface usa \`config_id\`, \`response_type: "code"\` e \`override_default_response_type: true\`. Não adicionar \`sessionInfoVersion\` legado de Embedded Signup v2/v3. O servidor confirma se o número pertence à WABA antes de guardar a conta.

## 5. Google — YouTube

No [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

1. Seleccionar o projecto Google que contém a aplicação YouTube.
2. Activar **YouTube Data API v3**.
3. Criar/seleccionar um OAuth Client ID do tipo **Web application**.
4. Em Authorized redirect URIs, adicionar o callback Supabase indicado na secção 1.
5. Configurar o ecrã de consentimento OAuth, dados de contacto, público e test users. Enquanto a app estiver em Testing, apenas os test users aprovados poderão concluir o fluxo.
6. Confirmar os scopes \`https://www.googleapis.com/auth/youtube.readonly\` e \`https://www.googleapis.com/auth/youtube.upload\`; a Google pode exigir verificação adicional para publicar fora dos test users.

O servidor usa Authorization Code + PKCE S256, pede acesso offline e valida o canal autenticado antes de registar a ligação. O login Google do CEO não é alterado por este fluxo.

## 6. Activação técnica (após revisão)

A sequência de produção será:

1. Aplicar a migração \`20261102100000_phase10_5_social_oauth.sql\`.
2. Confirmar RLS e privilégios: \`anon\` e \`authenticated\` não podem consultar as tabelas OAuth; apenas \`service_role\` pode fazê-lo.
3. Publicar \`annan-social-oauth\` com \`verify_jwt=false\` apenas porque o callback externo não carrega um JWT Supabase. O código valida manualmente JWT/CEO/admin nos pedidos do painel; o callback exige state de utilização única e validade curta.
4. Confirmar que todos os secrets estão definidos no projecto correcto.
5. Publicar o build Netlify pelo fluxo Git normal e validar o painel CEO.
6. Testar primeiro com contas de teste; só marcar uma conta como ligada quando o servidor conseguir validar a API e persistir o token cifrado.

## 7. Limites desta fase

Esta fase liga e identifica as contas e guarda credenciais cifradas. Não activa publicação, mensagens, campanhas pagas, anúncios ou despesa publicitária. Esses adaptadores serão submetidos a revisão e aprovação do CEO numa fase posterior.

O sistema deve manter o estado explícito de falha/revogação se a aplicação perder permissões ou se o utilizador cancelar a autorização.
