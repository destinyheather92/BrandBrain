# Feature 07: Canvas Object Model TDD Plan

## User Story

As a signed-in BrandBrain user, I can open a canvas model preview backed by validated editable slide JSON so future projects, AI generation, editor changes, autosave, versioning, and export all share one source of truth.

## Scope

- Define the BrandBrain canvas document, slide, and element schemas.
- Validate canvas JSON with Zod before future persistence.
- Support editable element types for text, images, logos, shapes, icons, and CTA blocks.
- Create a blank carousel canvas document with separate editable slides.
- Preserve existing user-edited element IDs, content, and positioning during validation.
- Reject flat rendered image sources as canvas/project source.
- Protect the `/canvas` route.
- Add a visual preview page for browser confirmation.

## Out of Scope

- Content projects and database persistence.
- Canva-style editing controls.
- Theme generation.
- AI slide generation.
- Autosave, version history, templates, and export.

## Red Phase

Run:

```bash
npm run test -- src/features/canvas/tests/canvas-object-model.service.test.ts src/features/canvas/tests/canvas-model-preview.test.tsx src/features/auth/tests/protected-route.service.test.ts > Docs/tdd/logs/07-canvas-object-model-red.txt
```

Expected failures:

- Canvas schema/service modules are not implemented yet.
- Canvas preview component is not implemented yet.
- Protected routes do not include `/canvas` yet.

## Green Phase

Implement the minimum code required for:

- `canvasDocumentSchema`
- `canvasSlideSchema`
- `canvasElementSchema`
- `createBlankCanvasDocument`
- `validateCanvasDocument`
- `getCanvasElementsInPaintOrder`
- `CanvasModelPreview`
- `/canvas` route protection and page

Run:

```bash
npm run test -- src/features/canvas/tests/canvas-object-model.service.test.ts src/features/canvas/tests/canvas-model-preview.test.tsx src/features/auth/tests/protected-route.service.test.ts > Docs/tdd/logs/07-canvas-object-model-green.txt
```

## Acceptance Criteria

- Canvas documents validate as editable JSON.
- Slides are not stored as flat images.
- Slide order values are unique.
- Element IDs are unique per slide.
- User-edited text, IDs, and positioning survive validation.
- `/canvas` is protected.
- The visual preview shows document metadata, slide thumbnails, and JSON source.
