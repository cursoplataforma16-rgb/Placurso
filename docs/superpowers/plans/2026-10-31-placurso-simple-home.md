# Placurso Simple Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the user-facing Placurso experience so a first-time mobile visitor immediately sees one clear action, one daily challenge, compact evolution, and skill shortcuts while preserving all existing Phase 3 functionality.

**Architecture:** Add one final presentation patch after Phase 3D. It does not rewrite the existing game engines or ANNAN profile core. It creates a compact home layer, hides redundant technical/legacy panels from the user, and routes actions into the existing games and crypto learning engine.

**Tech Stack:** Existing static HTML/JS engine, Python build patches, localStorage, vanilla CSS/JS.

**Spec:** Approved hybrid interface: “Olá. Vamos descobrir o teu próximo nível.” → Continuar desafio → resultado → ANNAN → próximo desafio.

## Global Constraints
- Keep Placurso only; do not modify DIONUEL/Kunica.
- Preserve Phase 3A, 3B, 3C and 3D engines and localStorage data.
- Mobile-first; one primary action per view.
- Hide technical phase labels from the public experience.
- No dark patterns or profit promises.
- Deploy only after the final branch is verified.

## Review Focus
- First-time user: must know what to tap immediately.
- Returning user: must have a clear next challenge.
- Existing progress: must remain readable and preserved.
- Crypto learning: must remain accessible through the money/trade path.
- Legacy panels: must not compete with the new home layer.

### Task 1: Add simplified home presentation patch
**Files:** Create `scripts/patch_simple_home.py`; modify `scripts/build_netlify.py`.
- [ ] Add a final patch marker and mobile-first hero/home layer.
- [ ] Add Continue, daily challenge, evolution summary, and skill shortcuts.
- [ ] Route buttons to existing `data-p3a` games and crypto level buttons.
- [ ] Hide redundant legacy Phase 3B/3D public panels and technical phase labels.
- [ ] Apply patch after Phase 3D.

### Task 2: Verify generated composition
**Files:** Create `scripts/test_simple_home_patch.py`.
- [ ] Verify patch order and marker composition.
- [ ] Verify required user-facing copy and selectors.
- [ ] Verify no DIONUEL/Kunica references are introduced.
- [ ] Verify generated JavaScript syntax with Node when available.

### Task 3: Release candidate
- [ ] Confirm branch head contains all Phase 3 work plus simple home.
- [ ] Run available CI/status checks.
- [ ] Verify Netlify preview/build before production.
- [ ] Merge PR #2 only after verification.
- [ ] Verify production deploy ID, commit, URL, and visible interface.
