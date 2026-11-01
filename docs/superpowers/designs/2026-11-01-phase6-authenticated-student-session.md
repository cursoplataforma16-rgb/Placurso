# Fase 6 — Sessão autenticada do aluno e sincronização ANNAN

**Data:** 2026-11-01  
**Estado:** implementação em branch, sujeita a CI e validação da configuração de redireccionamento de Auth.

## Objectivo

Substituir a inscrição meramente local por uma identidade real de aluno através do Supabase Auth. A Área de Aluno só deve abrir depois de o Supabase confirmar uma sessão válida. A aprendizagem continua a funcionar offline; quando o aluno entra, os resultados locais são enviados para a sua conta e reconciliados com o histórico remoto por ID estável.

## Estado confirmado

- O projecto Supabase Placurso `plataforma-curso` está activo.
- As tabelas `annan_learning_events` e `annan_student_profiles` existem e têm RLS activa.
- As políticas limitam as operações do aluno às linhas com `user_id = auth.uid()`; a chave service-role não é usada no browser.
- O adaptador já existia, mas só verificava `auth.getUser()`; o formulário de aluno ainda marcava a sessão como membro em localStorage, sem criar conta nem iniciar sessão.
- O histórico local está versionado em `placurso_annan_learning_v1`.

## Abordagem escolhida

Manter o site estático e o runtime ANNAN existente. Acrescentar ao adaptador browser operações `signUp`, `signInWithPassword`, `signOut`, `getCurrentUser` e `syncEvents`. O fluxo de comunidade chama essas operações; o estado local nunca é suficiente para abrir a Área de Aluno.

## Fluxo de conta

1. O visitante pode abrir o formulário de entrada para uma conta existente.
2. A criação de conta continua depois do fluxo de convite já existente; recolhe nome, email e palavra-passe com pelo menos 8 caracteres.
3. Se o projecto exigir confirmação de email, a interface explica que o aluno deve confirmar a mensagem e depois entrar. Sem sessão, não há acesso de membro.
4. A ligação de confirmação regressa ao endereço actual do Placurso. O endereço tem de estar permitido em Supabase Auth Redirect URLs.
5. Depois de `auth.getUser()` validar o utilizador, a Área de Aluno abre.
6. Terminar sessão invalida a sessão Supabase e devolve a interface ao estado público.

## Sincronização de aprendizagem

- Antes de carregar o histórico remoto, enviar até 120 eventos locais normalizados.
- Usar `upsert` com conflito `user_id,event_id`; reenvios não criam eventos duplicados.
- Depois, carregar os eventos remotos e reconciliar pelo ID estável com o core ANNAN.
- Guardar o resultado reconciliado em localStorage para continuidade offline.
- Em erro de rede, manter a aprendizagem local e informar que a sincronização ficou pendente.
- Persistir apenas fonte, jogo, nível, contagens, score, resultado e timestamp. Nunca guardar respostas brutas.

## Segurança e limites

- Só a sessão confirmada pelo Supabase abre a Área de Aluno; campos/flags em localStorage são apenas estado de interface.
- A autorização de dados continua nas políticas RLS já existentes, baseadas em `auth.uid()`.
- A chave publishable permanece pública; nenhuma service-role/secret key entra no browser.
- Nome e email não são usados para autorização.
- Não alterar tabelas, políticas RLS, engines de jogos, ANNAN recommendations ou fluxo público de convites.
- Não executar deployment nesta fase.

## Verificação

- Testes de contrato do adapter e fluxo de aluno.
- Teste de confirmação de email sem sessão.
- Testes de criação/entrada/saída de sessão, validação do utilizador, sincronização idempotente e recuperação da fila após falha.
- Testes de composição do fluxo comunitário.
- CI de Fase 6 e regressões das fases anteriores.
- Antes do release, confirmar no Supabase Auth que o Site URL e Redirect URLs incluem o domínio Placurso utilizado no signup.
