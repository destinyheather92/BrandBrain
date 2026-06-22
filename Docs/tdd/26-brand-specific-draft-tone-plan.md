# Feature 26: Brand-Specific Draft Tone Isolation TDD Plan

## User Story

As a BrandBrain user, when I generate draft slides for a counseling brand, the copy, tone, examples, and slide flow must match counseling/mental-health brand memory instead of leaking unrelated land-management language.

## Acceptance Criteria

- Vague prompts are refined using the current brand's memory, services, audience, and voice.
- Counseling brands produce warm, calm, supportive copy.
- Counseling drafts do not mention land clearing, grading, drainage, property prep, access paths, equipment, soil, or spring growth unless the user explicitly asks for those concepts.
- Land-management brands can still produce land-specific copy when that is the current brand.
- Canvas generation prompts explicitly forbid unrelated industry/domain carryover.

## Red

Run:

```bash
npm.cmd test -- src/features/ai/tests/local-canvas-generation.provider.test.ts src/features/ai/tests/canvas-generation.prompt.test.ts > Docs/tdd/logs/26-brand-specific-draft-tone-red.txt
```

Expected failures before implementation:

- Counseling-brand local generation still contains land-management fallback language.
- Canvas generation prompt does not explicitly block unrelated industry carryover.

## Green

Run:

```bash
npm.cmd test -- src/features/ai/tests/local-canvas-generation.provider.test.ts src/features/ai/tests/canvas-generation.prompt.test.ts > Docs/tdd/logs/26-brand-specific-draft-tone-green.txt
```

Expected result:

- Focused tests pass.
- Full typecheck, test, lint, and build pass before commit.
