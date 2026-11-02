# Placurso Calm Guided Interface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox ( [ ] ) syntax for tracking.

**Goal:** Simplificar a entrada pública do Placurso para que a pessoa escolha uma área de aprendizagem com pouco esforço e avance por um percurso claro, sobretudo no telemóvel.

**Architecture:** Manter a página estática gerada por scripts/build_placurso_clean_site.py. Substituir a apresentação densa por um cabeçalho mínimo, uma única chamada principal, quatro escolhas visuais e opções secundárias recolhidas. Reaproveitar os campos e as operações actuais da função annan-ensino; não alterar backend, login, painel CEO nem motores ANNAN.

**Tech Stack:** HTML, CSS e JavaScript nativos dentro do gerador Python existente; testes Python e validação JavaScript com Node; GitHub Actions / Netlify build já existentes.

**Spec:** docs/superpowers/specs/2026-11-02-placurso-calm-guided-interface.md

## Global Constraints

- Apenas Placurso; não tocar em DIONUEL/Kunica.
- Preservar os códigos de interesse actuais: tecnologia, educacao, agronomia, ambiente, telecomunicacoes, marketing, gestao, biblia, outro.
- Preservar studentProfile, ageGroup, interest, objective e o contrato de perfil_rapido.
- Não alterar autenticação Google, Supabase, ANNAN, rotas ou painel CEO.
- Não instalar dependências nem introduzir framework.
- Não publicar em produção nem fazer merge nesta tarefa.

## Review Focus

- Visitante sem sessão: consegue escolher uma área sem ser bloqueado por login imediato.
- Visitante que regressa após Google OAuth: a escolha temporária não deve ser perdida; não guardar tokens nem segredos.
- Área secundária: todas as opções devem continuar a mapear para os valores de interesse que o backend espera.
- Teclado/leitor de ecrã: cada escolha tem nome acessível, estado seleccionado e foco visível.
- Ecrã pequeno/movimento reduzido: não deve surgir scroll horizontal, targets pequenos ou animação obrigatória.

---

### Task 1: Tests for calm, guided entry

**Files:**
- Modify: scripts/test_placurso_clean_site.py

**Interfaces:**
- Consumes: build(public) from scripts/build_placurso_clean_site.py.
- Produces: regression assertions for the public learning-choice interface.

- [ ] **Step 1: Add failing regression tests**
  - Assert generated HTML includes learningAreas, four primary data-interest choices, allAreasToggle, moreLearningAreas, and selectedLearningPath.
  - Assert secondary areas are initially hidden and all nine existing interest codes remain represented.
  - Assert optional fields are inside a collapsed details element and challenges are inside a collapsed challengeDisclosure.
  - Assert primary actions and choices expose accessible labels/states and minimum 44px touch targets in CSS.
  - Assert reduced-motion styles exist and one inline script still passes node --check.

- [ ] **Step 2: Run the test to verify it fails**
  - Run: python scripts/test_placurso_clean_site.py
  - Expected: FAIL because the guided area chooser and secondary disclosures do not exist yet.

### Task 2: Redesign public landing and area selection

**Files:**
- Modify: scripts/build_placurso_clean_site.py

**Interfaces:**
- Consumes: current static HTML builder, current Supabase client/persistence API.
- Produces: accessible choice controls that set the existing interest field and open the existing learner flow.

- [ ] **Step 1: Replace landing markup and CSS**
  - Reduce header navigation and hero to one primary action.
  - Add four primary area cards: Tecnologia, Marketing e publicidade, Educação, Ensino bíblico.
  - Add a “Ver todas as áreas” disclosure with Agronomia, Engenharia ambiental, Telecomunicações, Gestão e negócios, Outra área.
  - Add a selected-path summary with a clear “Continuar” action and a “Mudar área” route back to the choices.
  - Keep active-course catalogue in a separate, compact section.
  - Put the existing challenge container in a native details section closed by default, preserving the pch-challenges hook.

- [ ] **Step 2: Implement selection behavior**
  - Use the existing interest values exactly.
  - Set the matching #interest select when a card is chosen.
  - Announce the choice through a small aria-live status; expose selected state using aria-pressed.
  - Keep the choice in a non-sensitive temporary draft only when required to survive the current Google OAuth return; do not store session tokens or credentials.
  - Wire “Continuar” to the existing start() flow, not a new backend or AI agent.

### Task 3: Reduce profile form friction

**Files:**
- Modify: scripts/build_placurso_clean_site.py

**Interfaces:**
- Consumes: existing studentProfile, ageGroup, interest, objective, perfil_rapido, loadLearning().
- Produces: required fields remain usable; non-essential fields appear only inside a collapsed optional disclosure.

- [ ] **Step 1: Keep only essential fields visible**
  - Show age group, preselected area and objective in the main form.
  - Move birthplace, phone and weekly study availability into “Mais opções (facultativo)”.
  - Keep defaults and input IDs compatible with the existing payload.
- [ ] **Step 2: Preserve learner and auth flow**
  - Restore the selected interest on page return.
  - Do not change Google OAuth callback URLs or Supabase session handling.
  - Keep existing student profile validation and perfil_rapido request unchanged.

### Task 4: Verify complete generated site

**Files:**
- Verify: scripts/test_placurso_clean_site.py, existing project workflows and build commands.
- Modify: docs/superpowers/ledgers/2026-11-02-placurso-calm-guided-interface.md

- [ ] **Step 1: Run focused tests**
  - Run: python scripts/test_placurso_clean_site.py
  - Expected: PASS.
- [ ] **Step 2: Run source isolation and route regression**
  - Run: python scripts/test_placurso_source_isolation.py
  - Run: python scripts/test_placurso_isolated_routes.py
  - Expected: PASS; no DIONUEL/legacy references and current /cursos handling preserved.
- [ ] **Step 3: Run full Netlify build**
  - Run: python scripts/build_netlify.py && python scripts/strategic_games_patch.py && python scripts/strategic_decision_game.py && node --check public/psico-engine.js && python scripts/test_ceo_login_build_output.py && python scripts/test_placurso_clean_site.py
  - Expected: all commands exit 0, including generated CEO/login assets and homepage JavaScript syntax.
- [ ] **Step 4: Review branch changes**
  - Verify only the public homepage builder, its test, and this feature's design/plan/ledger changed.
  - Confirm no changes to Supabase functions, migrations, CEO page, auth, or production redirects.
  - Open a PR for review; do not merge or publish.
