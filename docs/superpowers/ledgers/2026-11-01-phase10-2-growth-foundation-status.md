# Fase 10.2 — Registo de execução e validação

**Data:** 1 de Novembro de 2026  
**Branch:** feature/phase10-2-audience-growth-engine  
**PR:** #18 — em rascunho, não integrado em main.

## Resultado desta etapa

A fundação do PLACURSO AUDIENCE GROWTH ENGINE foi implementada como uma capacidade do ANNAN existente, sem criar um segundo motor de inteligência.

### Confirmado no Supabase activo

- Migração 20261101205317_phase10_2_growth_foundation aplicada.
- Sete tabelas de gestão criadas: contas, campanhas, conteúdos, aprovações, publicações, métricas e auditoria.
- RLS activo nas sete tabelas.
- Nenhuma política de acesso directo criada para estas tabelas.
- Privilégios directos revogados para anon, public e authenticated; acesso de gestão concedido apenas a service_role.
- RPC de aprovação usa SECURITY INVOKER, bloqueia o registo com FOR UPDATE, compara versão/hash e só pode ser executada por service_role.
- Verificação de privilégios: anon=false, authenticated=false, service_role=true para a RPC.
- Nenhum token de rede social foi guardado nesta fase.

### Implementado no branch

- Serviço annan-growth separado da função de ensino annan-ensino.
- Autenticação por JWT e verificação adicional de identidade CEO + perfil existente papel='admin'.
- Operações para consultar contas, criar/listar campanhas, criar/listar rascunhos, submeter para aprovação, aprovar/rejeitar e consultar auditoria.
- Registo de auditoria e chave de idempotência nas operações de escrita.
- Cliente web usa a sessão Supabase já existente, verifica o Gateway do ANNAN e não contém chaves privilegiadas.
- Painel Crescimento permite preparar campanhas e conteúdos; os controlos ficam fechados quando não há autorização.
- Registo da capacidade placurso-growth no Gateway central do ANNAN.
- O pipeline de build copia e carrega o cliente do Crescimento.
- Nenhuma publicação externa, OAuth, mensagem, anúncio ou recolha de métricas foi activada.

### Testes

A execução GitHub Actions Phase 10.2 Growth Gateway Verification, commit ede537754e506d080c3fc9b5bd037f4766b1a5aa, terminou com sucesso em todos os passos:

1. contrato de segurança e autorização CEO;
2. contrato das tabelas, RLS e privilégios;
3. 8 testes Deno do serviço;
4. integração de build/painel;
5. teste do Gateway existente;
6. regressões das Fases 8 e 9.

### Produção

- O PR #18 continua em rascunho.
- A produção Netlify mantém o commit 5152c9aebdb3450621ae10f1c15e031799507ad1, estado ready.
- A pré-visualização do PR está disponível em https://deploy-preview-18--placurso.netlify.app.
- A função annan-growth ainda não foi implantada no Supabase; annan-ensino permanece inalterada.

## Bloqueio administrativo deliberado

A tabela public.perfis não tem, neste momento, um registo CEO/admin provisionado. Por isso:

- o segredo PLACURSO_GROWTH_CEO_USER_ID ainda não foi configurado;
- a função deve ser implantada com verify_jwt=true;
- até existir a identidade Auth real e o registo correspondente papel='admin', a função deverá responder ceo_not_configured ou forbidden e não permitir alterações.

Não criar uma identidade fictícia, não usar email como autoridade e não confiar em user_metadata.

## Revisão de segurança preexistente

O advisor de segurança do Supabase continua a reportar achados fora do escopo desta migração:

- vista public.conteudos_publicos com SECURITY DEFINER (nível ERROR);
- função public.eh_admin() executável por anon e authenticated;
- funções antigas aprovar_pagamento, criar_pedido, obter_arquivo_produto e rejeitar_pagamento executáveis por authenticated;
- achados INFO de RLS sem políticas em tabelas existentes. Nas sete tabelas novas isto é intencional: as operações passam exclusivamente pelo serviço privilegiado.

Estes achados devem ser revistos separadamente, identificando primeiro os fluxos que dependem deles; não foram alterados nesta fase.

## Próximo bloco de execução

1. Confirmar a identidade Auth real do CEO e provisionar o perfil de administração segundo o modelo actual do Placurso.
2. Fazer revisão final do PR e implantar annan-growth com JWT obrigatório, mantendo o controlo CEO fechado até à configuração.
3. Ligar Meta/Facebook Pages e Instagram profissional pelo OAuth e APIs oficiais.
4. Seguir com TikTok e YouTube; tratar WhatsApp Business como canal de conversão e atendimento, não como feed.
5. Só depois activar distribuição, métricas reais, atribuição de leads/inscrições/vendas e aprendizagem contínua do ANNAN.
