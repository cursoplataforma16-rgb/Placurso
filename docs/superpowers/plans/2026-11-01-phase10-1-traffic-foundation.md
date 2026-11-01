# Plano de implementação — Fase 10.1: fundação de tráfego

**Data:** 2026-11-01  
**Branch:** `feature/phase10-traffic-foundation`  
**Desenho:** `docs/superpowers/specs/2026-11-01-phase10-1-traffic-foundation-design.md`

## Resultado esperado

Homepage com metadados correctos; duas páginas estáticas úteis (calculadora e guia); sitemap e robots gerados; anúncio A-Ads 2459988 preservado; build e verificações anteriores sem regressões.

## Tarefa 1 — Contratos de teste (RED)

Criar:
- `scripts/test_phase10_seo_metadata.py`
- `scripts/test_phase10_traffic_assets.py`
- `scripts/test_phase10_build_integration.py`
- `.github/workflows/phase10-traffic-foundation-verify.yml`

Os testes devem:
1. Executar o patch SEO num HTML temporário e confirmar que a descrição de alfaiataria é substituída, o título permanece Placurso e canonical/OG são únicos.
2. Executar `scripts/build_traffic_assets.py` numa pasta temporária.
3. Confirmar que existem `ferramentas/calculadora-margem/index.html`, `guias/calcular-margem-lucro/index.html`, `sitemap.xml` e `robots.txt`.
4. Confirmar que há H1, title, description, canonical e ligações HTML internas em ambas as páginas.
5. Confirmar que a calculadora tem os campos e fórmulas esperados, não divide por zero e valida taxa/margem impossíveis.
6. Confirmar exactamente uma unidade A-Ads 2459988 por página e a ligação “Advertise here”.
7. Confirmar que o build inclui os dois scripts e aplica o patch SEO antes de copiar a homepage e gera os novos recursos após copiar o site base.
8. Confirmar que ANNAN/DIONUEL não são alterados.

Executar os testes logo após a sua criação e observar a falha esperada antes de implementar.

## Tarefa 2 — Patch dos metadados da homepage (GREEN)

Criar `scripts/patch_placurso_seo.py` com função pública `patch(path: Path) -> None`.

- Substituir o primeiro `<title>` por `Placurso — cursos práticos, ferramentas e aprendizagem com ANNAN`.
- Substituir a meta description existente por uma descrição exclusivamente sobre formação, ferramentas digitais e aprendizagem.
- Garantir um único canonical para `https://placurso.netlify.app/`.
- Acrescentar Open Graph/Twitter coerentes, se ainda não existirem; actualizar tags existentes sem duplicar.
- Não modificar scripts, CSS ou o corpo funcional da aplicação.
- Falhar de forma clara se não existir `<head>` ou se houver mais de uma tag description.

## Tarefa 3 — Gerador dos activos de tráfego (GREEN)

Criar `scripts/build_traffic_assets.py`.

- Receber como argumento a pasta de publicação.
- Gerar a calculadora em `/ferramentas/calculadora-margem/index.html`.
- Gerar o guia em `/guias/calcular-margem-lucro/index.html`.
- Gerar sitemap e robots.txt.
- Reutilizar `AADS_UNIT` de `scripts/patch_aads_unit.py`; inserir só uma vez em cada nova página.
- Manter o texto principal acessível sem JavaScript. Usar JavaScript só para os cálculos.
- Usar HTML sem dependências externas, com CSS responsivo, labels acessíveis e links internos reais.

## Tarefa 4 — Integração do pipeline

Actualizar `scripts/build_netlify.py`:
1. Declarar `PATCH_SEO` e aplicar o patch à `WORK / 'index.html'` depois de validar o ficheiro.
2. Manter a execução existente de `PATCH_AADS` e todos os cores ANNAN.
3. Depois de copiar os recursos do pacote para `PUBLIC`, executar `build_traffic_assets.py PUBLIC`.
4. Confirmar no log os quatro activos e o estado da unidade A-Ads.

Não alterar a ordem dos cores ANNAN, as funções Netlify ou a lógica da Fase 4.

## Tarefa 5 — Verificação de ponta a ponta

- Executar os três testes específicos de Fase 10.
- Executar os testes existentes de A-Ads, Fase 4, Fase 6, Fase 7, Fase 8 e Fase 9 disponíveis nos workflows.
- Executar `python scripts/build_netlify.py` no GitHub Actions.
- Validar no output do build os quatro recursos e confirmar que `public/psico-engine.js` existe.
- Abrir PR com resumo e limites; aguardar checks verdes.
- Só integrar depois de confirmar o estado real dos checks e do diff.

## Riscos e controlos

- **Risco de duplicar anúncios:** teste conta exactamente uma unidade 2459988 nas novas páginas.
- **Risco de contaminar metadados:** teste proíbe termos DIONUEL/alfaiataria na homepage SEO.
- **Risco de quebrar o build:** workflow executa o pipeline completo sobre o pacote real.
- **Risco de interromper ANNAN:** não modificar os ficheiros dos cores nem as migrações Supabase.
- **Risco de conteúdo superficial:** guia explica margem versus markup com fórmula e exemplo numérico reproduzível.
