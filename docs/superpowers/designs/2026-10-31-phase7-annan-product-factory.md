# ANNAN Product Factory — Phase 7

The Product Factory is a deterministic planning core inside the single ANNAN architecture.

## Inputs
A normalized opportunity contains:
- stable opportunity ID
- product type
- title
- target audience
- concrete problem
- measurable/value-oriented promise
- source references

## Supported product types
- `ebook`
- `course`
- `calculator`
- `tool`

## Output
A valid opportunity produces a normalized brief and the fixed next-stage plan:
1. research
2. outline
3. draft
4. quality-review
5. pricing
6. publication-readiness

The core does not publish, charge, call external platforms, or create independent ANNAN instances.

## Architecture rule
Placurso and DIONUEL remain consumers/arms of one central ANNAN. Product Factory decisions may consume ANNAN learning/profile summaries, while generated product outcomes can later be written back to the same persistent ANNAN memory.
