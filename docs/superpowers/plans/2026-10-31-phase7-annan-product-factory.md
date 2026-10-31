# Phase 7 — ANNAN Product Factory

## Goal
Create the deterministic product-factory core for the single ANNAN shared by Placurso and DIONUEL. The first slice is a safe contract layer; generation/publication remains separated from decision logic.

## Scope
- Normalize a product opportunity into a bounded product brief.
- Support product types: ebook, course, calculator, tool.
- Validate required fields, supported types, audience, problem, promise, and source traceability.
- Produce a deterministic next-stage plan: research, outline, draft, quality review, pricing, publication readiness.
- Never publish, charge, or call external platforms from the core.
- Never store raw answers from learners.
- Keep the factory independent of a second ANNAN instance; it consumes ANNAN profile/learning summaries as inputs.

## TDD slices
1. Add contract tests for normalization, validation, deterministic stage planning, unsupported types, and missing evidence.
2. Implement the minimal Product Factory core to satisfy the tests.
3. Integrate the factory with the existing ANNAN learning/recommendation surface without changing existing learning behavior.
4. Add CI verification.
5. Verify all Phase 4/5/6 regressions and Phase 7 tests before opening a PR.

## Acceptance criteria
- Same input produces the same normalized brief and stage plan.
- Invalid opportunities are rejected without throwing uncontrolled errors.
- No publication/payment/external connector side effects exist in the core.
- Product types are explicitly allow-listed.
- Evidence/source references are required for a product opportunity.
- Factory output can be fed back into the same ANNAN memory later through stable IDs.
- A-Ads remains untouched.
