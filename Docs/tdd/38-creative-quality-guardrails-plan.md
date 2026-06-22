# 38 Creative Quality Guardrails TDD Plan

## User Story

As a BrandBrain user, I need vague ideas to become legitimate, brand-specific briefs, themes, and editable draft slides so the generated work helps me create a real post instead of generic filler.

## Acceptance Criteria

- A vague counseling prompt is refined into a specific mental-health creative brief using the brand memory.
- A counseling brand named with ambiguous words such as "Land" must not be classified as land management.
- Theme generation must produce domain-appropriate image direction and readable brand palettes.
- Draft slides generated from a creative brief must include useful, brand-specific copy and avoid generic fallback phrases.

## TDD Steps

1. Add failing tests for counseling brief quality, mental-health theme classification, and brief-driven slide copy.
2. Capture the failing run in `Docs/tdd/logs/38-creative-quality-guardrails-red.txt`.
3. Implement the minimum quality guardrails in the creative brief, theme engine, and local canvas generator.
4. Capture the passing run in `Docs/tdd/logs/38-creative-quality-guardrails-green.txt`.
5. Run build/lint as verification.
