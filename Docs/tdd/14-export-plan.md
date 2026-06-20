# Feature 14: Export TDD Plan

## User Story

As a signed-in BrandBrain user, I can export my editable project as PNG, JPG, or PDF without flattening the stored project source.

## Scope

- Render canvas JSON into exportable slide artwork.
- Add PNG export.
- Add JPG export.
- Add multi-slide PDF export.
- Add an editor export panel.
- Keep the saved project source as editable canvas JSON.

## Out of Scope

- Server-side export workers.
- Export history storage.
- Social publishing.
- Print bleed/crop marks.

## Red Phase

Run:

```bash
npm run test -- src/features/exports/tests/canvas-export.service.test.ts src/features/exports/tests/export-panel.test.tsx src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/14-export-red.txt
```

Expected failures:

- Export service does not exist yet.
- Export panel does not exist yet.
- Editor does not expose export controls yet.

## Green Phase

Implement the minimum code required for:

- `buildCanvasSlideSvg`
- `downloadCanvasDocument`
- `buildPdfDocument`
- `ExportPanel`
- Editor integration

Run:

```bash
npm run test -- src/features/exports/tests/canvas-export.service.test.ts src/features/exports/tests/export-panel.test.tsx src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/14-export-green.txt
```

## Acceptance Criteria

- The editor shows an Export panel.
- PNG, JPG, and PDF export buttons are available.
- Exports render from current editable canvas JSON.
- PNG/JPG export each slide as an image.
- PDF export includes each slide as a page.
- The saved project remains editable canvas JSON.
