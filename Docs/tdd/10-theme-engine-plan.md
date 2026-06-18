# Feature 10: Theme Engine TDD Plan

## User Story

As a signed-in BrandBrain user, I can generate a brand-aware creative theme before slide generation so every editable project has a reusable color, type, layout, and image direction stored separately from slides.

## Scope

- Define a persisted project theme model separate from canvas slides.
- Generate a deterministic theme from brand profile and brand memory.
- Store one current theme per project.
- Load the saved theme in the project editor.
- Let users apply the saved theme to editable canvas JSON without replacing user-edited copy, layout, or objects.
- Surface palette, typography, layout, and image style in the editor.

## Out of Scope

- AI provider calls.
- Slide generation.
- Autosave.
- Theme version history.
- Template selection.
- Export styling.

## Red Phase

Run:

```bash
npm run test -- src/features/themes/tests/theme-engine.service.test.ts src/features/themes/tests/theme-engine-panel.test.tsx > Docs/tdd/logs/10-theme-engine-red.txt
```

Expected failures:

- Theme service does not exist yet.
- Theme panel does not exist yet.
- Project theme schemas, types, and repository contracts do not exist yet.

## Green Phase

Implement the minimum code required for:

- `ProjectTheme` schema and types.
- `ThemeService` deterministic generation from brand + brand memory.
- Theme persistence repository.
- Prisma `Theme` table.
- Theme generation server action.
- Theme panel in the project editor.
- Canvas theme application that preserves existing user edits.

Run:

```bash
npm run test -- src/features/themes/tests/theme-engine.service.test.ts src/features/themes/tests/theme-engine-panel.test.tsx > Docs/tdd/logs/10-theme-engine-green.txt
```

## Acceptance Criteria

- Users can generate a theme from a project editor before AI slide generation exists.
- The theme is stored separately from `canvasJson`.
- The editor shows the generated palette, type system, layout rule, and image style.
- Applying a theme updates visual styling while preserving user-edited text, CTA labels, object positions, and object sizes.
- The canvas document records the applied theme ID.
