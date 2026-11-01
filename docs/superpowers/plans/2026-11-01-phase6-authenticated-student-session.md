# Plano — Fase 6: sessão autenticada e sincronização do aluno

**Branch:** `feature/phase6-auth-session-persistence`  
**Desenho:** `docs/superpowers/designs/2026-11-01-phase6-authenticated-student-session.md`

## Resultado esperado

A Área de Aluno exige uma sessão Supabase confirmada; o registo e o login deixam de criar apenas um membro local. O histórico ANNAN local é enviado para a conta e reconciliado por ID, com fallback offline.

## Tarefas

- [x] Acrescentar operações Auth ao adaptador: criação de conta, login, logout e validação de utilizador.
- [x] Enviar eventos locais normalizados com upsert idempotente por `user_id,event_id`.
- [x] Recuperar a fila de sincronização depois de uma falha transitória.
- [x] Bloquear o acesso de aluno quando só existe uma marca local; exigir `auth.getUser()` confirmado.
- [x] Tratar confirmação de email sem sessão: informar o aluno e manter a área privada fechada.
- [x] Restaurar a sessão persistida ao abrir o Placurso.
- [x] Manter o histórico local em caso de falha remota.
- [x] Acrescentar testes de comportamento do adaptador e contrato do fluxo de aluno.
- [x] Integrar os testes no workflow de Fase 6.
- [ ] Confirmar que o Site URL e Redirect URLs de Supabase Auth incluem `https://placurso.netlify.app/`.
- [x] Executar CI completa e rever o diff final.
- [ ] Integrar na `main` apenas depois de checks verdes e configuração de redirect confirmada.
- [x] Não efectuar deployment de produção nesta fase.

## Testes

1. Node: `node --check scripts/annan_supabase_adapter.js`
2. Node: `node scripts/test_annan_supabase_adapter.js`
3. Python: `python scripts/test_phase6_authenticated_session_contract.py`
4. Python: `python scripts/test_community_flow_pipeline.py`
5. Workflow: `Phase 6 Verification` + regressões de fases anteriores.

## Fronteiras

Sem alterações ao schema/RLS, sem service-role key no browser, sem armazenamento de respostas brutas, sem engines paralelos e sem deployment.
