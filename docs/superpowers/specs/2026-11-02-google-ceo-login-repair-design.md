# Correcção definitiva do login Google CEO

**Data:** 2026-11-02  
**Estado:** desenho para aprovação; ainda sem alteração de código ou base de dados.

## Intenção

Permitir que a conta principal `belcianycosmedionisio@gmail.com` entre no Placurso com Google e seja reconhecida como a única identidade CEO. Hoje, o Google autentica, mas a verificação administrativa rejeita a conta.

## Causa confirmada

A identidade singleton `public.growth_ceo_identity` está associada a `johnjunior.tchek@gmail.com` e ao UUID Auth antigo. O perfil desse UUID tem `papel = 'admin'`. O mesmo email antigo está fixado no serviço seguro `annan-growth` e no patch que constrói o fluxo de login do site. O browser, a função e a base de dados estão desalinhados com a conta principal definida.

A conta Google nova ainda não consta em `auth.users`; por isso, a associação final só poderá acontecer no primeiro login Google bem-sucedido após a correcção.

## Objectivos

- Tornar `growth_ceo_identity` a única fonte da identidade CEO.
- Autorizar apenas `belcianycosmedionisio@gmail.com`, com email confirmado e provider Google.
- Desassociar a identidade antiga e retirar-lhe o papel administrativo, preservando a conta e os dados.
- Manter ANNAN como o mesmo motor central.
- Fazer o servidor decidir a autorização; o browser não decide quem é CEO através de email hardcoded.
- Manter utilizadores comuns no fluxo normal de aluno.

## Não-objectivos

- Não criar uma segunda conta CEO nem outro motor ANNAN.
- Não apagar utilizadores, cursos, histórico ou dados.
- Não activar publicação em redes, gastos de anúncios ou novas integrações.
- Não alterar palavras-passe, credenciais OAuth do Google ou políticas de alunos sem evidência de necessidade.

## Abordagens consideradas

1. **Substituir o email antigo em todos os ficheiros e na base de dados.** Menor alteração, mas mantém a identidade duplicada em vários lugares e sujeita a nova divergência.
2. **Base de dados como fonte única (escolhida).** A função valida provider Google + email confirmado e compara o email com a identidade singleton; o browser apenas solicita o bootstrap e respeita a resposta do servidor. A migração muda o email autorizado, liberta o UUID antigo e rebaixa o perfil antigo para aluno. Esta abordagem elimina o email hardcoded da autorização do browser e centraliza a decisão.
3. **Reformular todo o sistema de autenticação para Next.js SSR.** Não encaixa no site estático actual e é desproporcionado para esta falha.

## Alterações previstas

1. Criar uma migração aditiva e segura que:
   - confirme a identidade singleton actual;
   - altere o email autorizado para `belcianycosmedionisio@gmail.com`;
   - limpe `auth_user_id` e `claimed_at` para permitir a associação única ao UUID Auth da conta principal no primeiro login;
   - altere de `admin` para `aluno` o perfil associado ao UUID antigo, caso ainda esteja como administrador.
2. Ajustar `supabase/functions/annan-growth/index.ts` para deixar de fixar um endereço no teste do provider Google; o email permitido continuará a ser comparado com o singleton da base de dados em bootstrap e em cada operação CEO.
3. Ajustar `scripts/patch_annan_growth_assets.py` para chamar o bootstrap após o retorno Google sem decidir localmente pelo endereço. Só a resposta autorizada do servidor abre o fluxo CEO; um 403 de identidade não autorizada deixa o utilizador continuar pelo fluxo normal de aluno, enquanto falhas técnicas são apresentadas.
4. Actualizar testes do browser, da função e o contrato da migração para cobrir conta principal, conta antiga, provider não Google, perfil antigo rebaixado e utilizadores comuns.
5. Reexecutar a suite de testes, publicar a função Edge com `verify_jwt = true`, reconstruir o site Placurso e verificar o estado da identidade na base de dados.

## Segurança e compatibilidade

- A identidade CEO continua a exigir sessão JWT válida, email confirmado, provider Google e correspondência exacta (normalizada) com a identidade singleton.
- O UUID é associado uma única vez com condição `auth_user_id IS NULL`; nenhum pedido do browser pode escolher o UUID CEO.
- A chave `service_role` permanece apenas no ambiente seguro da função.
- O perfil antigo deixa de ter privilégios admin; os seus dados e conta Auth não são apagados.
- O site mantém o fluxo de aluno e o mesmo ANNAN, sem alterar outras fases.

## Verificação e limite do teste

Os testes automatizados devem provar que a conta antiga é rejeitada e que uma identidade Google verificada com o email principal consegue reclamar a vaga CEO uma única vez. Depois do deploy, a confirmação completa exige um login Google real no navegador com `belcianycosmedionisio@gmail.com`; não é possível simular essa aprovação externa sem executar a sessão Google do utilizador.
