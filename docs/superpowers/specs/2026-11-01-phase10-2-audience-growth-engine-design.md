# Fase 10.2 — PLACURSO AUDIENCE GROWTH ENGINE

**Data:** 2026-11-01  
**Estado:** proposta de arquitectura alinhada com a direcção indicada pelo utilizador; pronta para revisão antes de activar credenciais ou publicação real.

## 1. Intenção

Transformar a actual área **Crescimento Placurso** num sistema operacional de aquisição de audiência e conversão. O objectivo não é apenas ligar contas sociais: é permitir que o ANNAN identifique públicos e problemas, planeie conteúdos adequados a cada rede, coordene a publicação autorizada, leia resultados reais e aprenda com o que gera visitas, contactos, inscrições, compras e receita.

O ANNAN continua a ser o único motor central de inteligência. O Growth Engine é uma capacidade do ANNAN, não uma segunda IA nem um produto paralelo.

## 2. Estado actual confirmado

- O repositório principal é `cursoplataforma16-rgb/Placurso`, branch `main`.
- A produção Netlify está publicada e pronta no commit `5152c9a`; a área Crescimento Placurso e o módulo de voz ANNAN estão nesse deploy.
- O ficheiro `scripts/placurso-growth-center.js` já apresenta Facebook Pages, Instagram, TikTok, YouTube, WhatsApp Business e X como canais ainda não ligados, e inclui um gerador local de briefing.
- Esse painel ainda não realiza OAuth, publicação real, recolha de métricas ou sincronização de leads.
- `scripts/annan_integration_gateway.js` já define o Gateway de integrações do ANNAN, mas é um registo local, sem chamadas externas. O Execution Engine e o Autonomous Workflow também já existem.
- O projecto Supabase activo está saudável e contém dados de alunos, cursos e aprendizagem. Ainda não existem tabelas de contas sociais, campanhas, conteúdos, publicações, métricas ou aprovações.
- A função `annan-ensino` existe para a experiência de aprendizagem. Não deve ser sobrecarregada com tarefas de redes sociais.
- A Fase 10.1 — SEO, calculadora e páginas de entrada orgânica — é uma linha de trabalho separada. Esta Fase 10.2 não substitui nem duplica aquela fase.

## 3. Objectivos

1. Criar um único contrato de integração para redes sociais, APIs, webhooks e conectores MCP.
2. Manter credenciais e tokens exclusivamente no servidor, cifrados em repouso e inacessíveis ao browser.
3. Guardar contas autorizadas, campanhas, conteúdos, aprovações, publicações, métricas e histórico de operações.
4. Exigir autenticação e autorização administrativa no servidor antes de qualquer operação de gestão.
5. Permitir que o ANNAN prepare e adapte conteúdo por plataforma, sem publicar o mesmo formato indiscriminadamente em todas as redes.
6. Exigir aprovação do CEO antes de uma publicação pública ou despesa com anúncios. A automatização futura poderá executar regras previamente aprovadas, sem retirar o poder de controlo do CEO.
7. Medir apenas dados recebidos de fontes reais, com plataforma, conta, publicação, métrica e data de recolha.
8. Criar um ciclo de melhoria: observar → analisar → decidir → criar → aprovar → publicar → medir → aprender.

## 4. Fora de âmbito nesta fase

- Não criar outro ANNAN, outro perfil de inteligência ou um segundo motor de decisões.
- Não publicar ainda em contas reais nem pedir credenciais de redes nesta primeira entrega.
- Não simular contas ligadas, publicações, alcance, seguidores, vendas ou receitas.
- Não expor tokens, segredos OAuth, service-role keys ou credenciais em JavaScript público, HTML, logs ou respostas da API.
- Não automatizar likes, follows, comentários repetitivos, mensagens não solicitadas, tráfego artificial ou mecanismos de engajamento falso.
- Não prometer viralização nem tentar contornar os sistemas de recomendação das plataformas.
- Não iniciar despesa publicitária sem limite e aprovação explícitos.
- Não migrar o site estático para outro framework ou alojamento nesta fase.

## 5. Abordagens consideradas

### A. Ligações directas no browser

O browser faria OAuth e chamaria directamente as APIs das redes.

**Rejeitada:** aumenta o risco de exposição de tokens, dificulta a auditoria central e espalha a lógica por vários scripts.

### B. Serviço externo de gestão de redes sociais

Um agregador externo faria as integrações e a publicação.

**Não escolhida como base:** pode ser avaliado mais tarde como conector, mas introduz dependência, custo recorrente e limitações sobre os dados e o fluxo de decisão do ANNAN.

### C. Gateway seguro no servidor, ligado ao ANNAN existente

Estender o Gateway actual, criar uma função de servidor `annan-growth` e tabelas de gestão protegidas no Supabase activo. O painel Placurso comunica com esse serviço através da sessão autenticada existente.

**Escolhida:** reaproveita o Supabase e os componentes ANNAN já existentes, preserva o site e mantém uma única fronteira para permissões, tokens, publicação e métricas.

## 6. Arquitectura escolhida

```
ANNAN (motor central)
   │
   ├── Inteligência de público
   ├── Inteligência de conteúdo
   ├── Inteligência por plataforma
   │
   ▼
Gateway ANNAN existente
   │
   ▼
annan-growth (serviço seguro no servidor)
   ├── autorização / CEO
   ├── contas / OAuth / tokens cifrados
   ├── campanhas / conteúdos / aprovações
   ├── fila de publicação / webhooks
   └── recolha de métricas
   │
   ▼
Adaptadores oficiais por plataforma
   ├── Meta: Facebook Pages / Instagram profissional
   ├── TikTok
   ├── YouTube
   ├── WhatsApp Business (conversas e leads, não feed)
   └── X
   │
   ▼
Métricas reais → Funil Placurso → Aprendizagem ANNAN
```

O Gateway do browser não guarda segredos nem executa pedidos directos às redes. O serviço de servidor valida a sessão, confirma a autorização administrativa, aplica as regras de aprovação, chama o adaptador adequado e regista o resultado. O serviço `annan-growth` é uma fronteira técnica de execução, não um novo cérebro.

## 7. Domínios de dados

A primeira versão deverá preparar estes domínios, sem armazenar dados desnecessários:

- **Contas:** plataforma, identificador externo, nome apresentado, tipo de conta, estado, permissões concedidas, responsável e datas de validade.
- **Credenciais:** tokens cifrados, versão da chave e validade. Nunca devolver estes campos à aplicação.
- **Campanhas:** objectivo, público, oferta, orçamento máximo, estado e responsável.
- **Conteúdos:** texto, formato, plataforma-alvo, activos multimédia, versão, estado e campanha.
- **Aprovações:** conteúdo e versão aprovados, decisor, decisão, data e observação.
- **Publicações:** conta, conteúdo, identificador externo, estado, agendamento, resultado e chave de idempotência.
- **Métricas:** nome nativo da métrica, valor, origem, período, data de recolha e referência à publicação.
- **Auditoria:** actor, acção, objecto, resultado e data. Não registar tokens nem dados sensíveis.

Os dados de conversão — leads, inscrições, compras e receita atribuída — serão adicionados na fase de funil, ligados aos identificadores de campanha e origem. Não se devem misturar métricas de plataforma com vendas confirmadas no Placurso.

## 8. Segurança e autoridade

- A função de servidor deve exigir JWT válido para operações iniciadas pelo painel e verificar no servidor se o utilizador tem autorização administrativa. Não confiar em `user_metadata` nem num simples campo enviado pelo browser.
- A auditoria actual mostrou que a tabela `public.perfis` não tem registos. Antes de activar operações administrativas, é necessário confirmar e provisionar a identidade real do CEO no modelo de autenticação do projecto; não se deve criar uma autorização fictícia nem abrir o endpoint ao público.
- Todas as tabelas de gestão devem ter RLS activo e privilégios directos revogados a `anon` e `authenticated`; o serviço de servidor usa apenas credenciais privilegiadas guardadas no ambiente seguro.
- Tokens devem ser cifrados no servidor com uma chave secreta fora da base de dados; renovação e revogação devem ser controladas.
- OAuth deve usar `state` de utilização única, validade curta e validação de redirect URI.
- Webhooks devem validar assinatura/origem, tolerar eventos repetidos e ser idempotentes.
- Publicar exige aprovação do CEO para a versão exacta do conteúdo. Alterar texto, mídia ou destino invalida a aprovação anterior.
- Orçamento publicitário exige aprovação separada, limite diário e limite total.
- Toda a falha externa deve ser registada sem expor tokens ou respostas sensíveis.

## 9. Estratégia de plataformas e compatibilidade

Os adaptadores são independentes e declaram as capacidades que realmente suportam: publicar texto, imagem, vídeo, Reel/Short, carrossel, consultar perfil, recolher métricas ou receber webhooks. A interface não deve mostrar uma capacidade como disponível antes de a API, o tipo de conta, as permissões e a aprovação da aplicação a confirmarem.

Ordem proposta:

1. **Meta — Facebook Pages e Instagram profissional:** primeiro bloco de integração, validando separadamente as permissões e os tipos de conta suportados pela Meta.
2. **TikTok:** segundo adaptador. A documentação oficial exige aprovação e autorização do âmbito `video.publish` para Direct Post; clientes ainda não auditados restringem o conteúdo publicado ao modo privado. Por isso, a implementação deve ter estados claros de teste, auditoria e produção.
3. **YouTube:** terceiro adaptador. O envio de vídeos usa OAuth com o âmbito `youtube.upload`; métricas de canal e conteúdo dependem da YouTube Analytics API e dos âmbitos autorizados.
4. **WhatsApp Business:** canal de atendimento e conversão com consentimento e regras próprias; não deve ser tratado como uma rede de publicação de feed.
5. **X:** adaptador opcional, activado após confirmação do acesso disponível, limites e modelo de cobrança vigente.

Fontes oficiais de referência a validar novamente durante cada integração:

- Meta Instagram Content Publishing: https://developers.facebook.com/docs/instagram-platform/content-publishing
- Meta Pages API: https://developers.facebook.com/documentation/pages-api/
- Meta WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- TikTok Content Posting API: https://developers.tiktok.com/products/content-posting-api/
- TikTok Direct Post: https://developers.tiktok.com/docs/en/content-posting-api-reference-direct-post
- YouTube video upload: https://developers.google.com/youtube/v3/docs/videos/insert
- YouTube Analytics metrics: https://developers.google.com/youtube/analytics/metrics
- X Developer Platform: https://developer.x.com/

As regras, permissões, limites, auditorias e custos podem mudar. Cada adaptador deve consultar a documentação oficial actualizada antes de ser activado.

## 10. Inteligência e optimização

O ANNAN deverá:

1. identificar públicos, dores, necessidades e problemas que os cursos realmente resolvem;
2. propor temas e ângulos de conteúdo com evidência e hipótese declarada;
3. produzir versões próprias para cada rede, respeitando formato, linguagem, duração e limites;
4. avaliar clareza, utilidade, adequação ao público, originalidade e risco de política;
5. recomendar **PUBLICAR**, **REFORMULAR** ou **NÃO PUBLICAR**;
6. comparar resultados por conteúdo, plataforma, público, formato, horário e chamada para acção;
7. aprender com visitas e conversões reais, sem interpretar correlação como causalidade.

A pontuação de prontidão para recomendação será um diagnóstico interno baseado nos dados disponíveis, nunca uma promessa de alcance ou viralização. O ANNAN deve explicar quando os dados são insuficientes.

## 11. Critérios de aceitação da Fase 10.2

- Existe um contrato único e testado entre ANNAN, Gateway e o serviço de crescimento.
- O endpoint rejeita utilizador sem sessão válida e utilizador sem autorização administrativa.
- Nenhum token ou segredo aparece nas respostas, no browser ou nos logs.
- As tabelas de gestão têm RLS activo e não permitem acesso directo público.
- É possível criar e consultar campanhas e rascunhos através do serviço autenticado.
- É possível submeter conteúdo para aprovação, aprovar ou rejeitar e registar a decisão.
- Não é possível publicar um conteúdo não aprovado.
- Cada operação administrativa produz um registo de auditoria.
- O painel mostra dados reais ou estados vazios explícitos; não inventa contas nem métricas.
- Os testes existentes de ANNAN, aprendizagem, A-Ads e build continuam sem regressões.
- Nenhuma publicação externa ou despesa publicitária é activada nesta fase.

## 12. Próximas fases

- **10.2 — Gateway e base segura:** contratos, autenticação administrativa, tabelas, campanhas, conteúdos e aprovações.
- **10.3 — Inteligência de audiência:** investigação de públicos, fontes, problemas, tendências e oportunidades.
- **10.4 — Estúdio de conteúdo:** textos, guiões, carrosséis, vídeos, calendário, versões por rede e revisão do CEO.
- **10.5 — Adaptadores oficiais:** OAuth, descoberta de contas e publicação por capacidade; Meta primeiro, depois TikTok e YouTube, com WhatsApp e X tratados segundo as suas regras.
- **10.6 — Distribuição fiável:** fila, agendamento, tentativas seguras, webhooks, estados de publicação e reconciliação.
- **10.7 — Métricas e conversão:** alcance, retenção, interacção, tráfego, leads, inscrições, vendas e receita atribuída.
- **10.8 — Experiências e aprendizagem:** testes controlados, comparação, diagnóstico e optimização contínua pelo ANNAN.

