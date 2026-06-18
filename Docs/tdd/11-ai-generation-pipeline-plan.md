# Feature 11: AI Generation Pipeline TDD Plan

## User Story

As a signed-in BrandBrain user, I can generate a brand-consistent draft carousel inside a saved project after a theme exists, and the result is stored as editable canvas JSON.

## Scope

- Add a structured AI generation pipeline for carousel draft generation.
- Build prompts from brand memory, project context, and the approved project theme.
- Route canvas generation through a provider abstraction.
- Validate provider output against the Canvas Object Model before saving.
- Retry once when provider output is invalid.
- Preserve user-edited slides by only filling blank slides.
- Persist generation cost metadata.
- Add an editor panel action to generate draft slides and update the visible canvas.

## Out of Scope

- Live OpenAI/Ideogram/Flux/Imagen network calls.
- AI image generation.
- Autosave/version history.
- Templates.
- Export.
- Single-slide regeneration.

## Red Phase

Run:

```bash
npm run test -- src/features/ai/tests/ai-generation-pipeline.service.test.ts src/features/ai/tests/ai-generation-panel.test.tsx src/features/ai/tests/canvas-generation.prompt.test.ts > Docs/tdd/logs/11-ai-generation-pipeline-red.txt
```

Expected failures:

- AI generation service does not exist yet.
- AI prompt builder does not exist yet.
- AI generation panel and action state do not exist yet.
- Cost repository contracts do not exist yet.

## Green Phase

Implement the minimum code required for:

- `buildCanvasGenerationPrompt`
- `generateProjectDraftForUser`
- provider routing and retry-on-invalid-output
- local structured generation provider
- `GenerationCost` persistence model and repository
- `generateProjectDraftAction`
- `AiGenerationPanel`
- editor integration

Run:

```bash
npm run test -- src/features/ai/tests/ai-generation-pipeline.service.test.ts src/features/ai/tests/ai-generation-panel.test.tsx src/features/ai/tests/canvas-generation.prompt.test.ts > Docs/tdd/logs/11-ai-generation-pipeline-green.txt
```

## Acceptance Criteria

- Generation is blocked until a project theme exists.
- AI output must validate as canvas JSON before it is saved.
- Invalid provider output is retried once.
- Existing user-edited slides are preserved.
- Generated slides remain editable canvas objects.
- Generation cost metadata is recorded for successful provider calls.
