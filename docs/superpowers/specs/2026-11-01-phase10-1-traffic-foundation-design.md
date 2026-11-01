# Fase 10.1 — Fundação de tráfego orgânico e monetização

**Data:** 2026-11-01  
**Estado:** aprovado para execução por pedido explícito de aplicação do utilizador

## Intenção

Tornar o Placurso mais descobrível por pesquisa orgânica e oferecer uma primeira ferramenta gratuita que resolva um problema frequente de pequenos negócios: calcular custo, preço, margem e lucro por unidade. A ferramenta deve criar uma entrada útil para visitantes, encaminhar naturalmente para cursos e manter a monetização A-Ads sem tornar a página intrusiva.

## Evidência actual

- A página inicial publicada usa uma meta description de alfaiataria/DIONUEL, embora o conteúdo seja Placurso.
- O sitemap publicado só apresenta `/cursos`.
- `/robots.txt` não foi encontrado com uma resposta válida durante a auditoria.
- A unidade A-Ads 2459988 está presente e deve ser preservada exactamente.
- O site é construído a partir de `placurso-site-root.zip` por `scripts/build_netlify.py`; os motores ANNAN são adicionados ao mesmo runtime nesse processo.

## Objectivos

1. Corrigir title/description da página inicial e acrescentar canonical e metadados sociais coerentes com Placurso.
2. Gerar uma página estática e mobile-first em `/ferramentas/calculadora-margem/`.
3. Gerar um guia prático em `/guias/calcular-margem-lucro/`, com ligações internas para a calculadora e para os cursos.
4. Publicar sitemap XML e robots.txt com os URLs públicos canónicos.
5. Manter uma única unidade A-Ads 2459988 em cada nova página, reutilizando o código exacto já aprovado.
6. Manter ANNAN, Supabase, DIONUEL e os fluxos existentes sem alterações funcionais.

## Fora de âmbito

- Não criar nem fundir um novo ANNAN, nem tocar no ANNAN da DIONUEL.
- Não adicionar mais unidades A-Ads, tráfego artificial, pop-ups, compra de visitas ou mecanismos de clique.
- Não configurar GA4/PostHog sem um identificador/conta de medição confirmados.
- Não migrar para Next.js, CMS ou outro alojamento.
- Não prometer posições no Google, tráfego ou receitas.

## Abordagens consideradas

1. **Páginas estáticas geradas durante o build (escolhida):** aproveita o pipeline Netlify existente; entrega HTML legível aos crawlers e não acrescenta serviços externos.
2. **Transformar todo o site numa aplicação SSR/CMS:** oferece mais flexibilidade futura, mas é uma migração maior e desnecessária para a primeira entrega.
3. **Injectar apenas conteúdo e metadados no browser:** menor esforço imediato, mas deixa maior dependência da execução de JavaScript por crawlers e não corrige a falta de páginas de entrada autónomas.

## Decisões de implementação

- Manter a estrutura estática actual e gerar os novos ficheiros em `public/` após a cópia do site base.
- A calculadora usa moeda seleccionável, com AOA predefinido; calcula custo total, taxa variável, lucro por unidade, margem, markup, preço de equilíbrio e preço para margem pretendida.
- Exibir claramente que os cálculos são estimativas comerciais antes de impostos.
- Incluir links HTML normais e conteúdo de apoio na página, sem depender de JavaScript para a indexação do texto.
- Reutilizar a unidade A-Ads 2459988 exactamente como está; não adicionar outra unidade.
- Usar testes de contrato e teste real de build antes de abrir PR.

## Critérios de aceitação

- A meta description da homepage deixa de mencionar roupa, alfaiataria ou DIONUEL.
- A homepage tem canonical próprio e Open Graph coerente.
- As duas novas páginas respondem com HTML próprio, título, descrição, canonical, H1, links internos e conteúdo útil.
- O cálculo funciona em AOA e noutras moedas disponíveis, incluindo tratamento de valores inválidos e taxa de 100%.
- Sitemap inclui homepage, cursos, calculadora e guia; robots.txt aponta para o sitemap.
- Cada nova página contém exactamente uma unidade A-Ads 2459988.
- O build gera os ficheiros sem erros; verificações anteriores de ANNAN e A-Ads continuam a passar.
