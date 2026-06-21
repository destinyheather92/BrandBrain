# Feature 18: Inline Text Editing and Organized Panels TDD Plan

## User Story

As a BrandBrain user editing a canvas, I can edit text directly on the canvas and use a cleaner right rail where properties, export, and version history are organized instead of cluttered.

## Scope

- Add direct canvas text editing for text and CTA objects.
- Add a Properties inspector section switcher with icon buttons for Content, Position, and Style.
- Show X, Y, width, height, and layer only in the Position section.
- Move typography/color controls into the Style section.
- Collapse Export by default and reveal export formats from its dropdown panel.
- Collapse Version History by default and reveal restore options from its dropdown panel.

## Out of Scope

- Rich text spans inside one text object.
- Full keyboard shortcut system.
- Multi-select style editing.
- New export formats.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx src/features/exports/tests/export-panel.test.tsx > Docs/tdd/logs/18-inline-edit-organized-panels-red.txt
```

Expected failures:

- Canvas text and CTA objects do not expose inline editing controls yet.
- Properties does not have section buttons yet.
- Export and Version History are not collapsed dropdown panels yet.

## Green Phase

Implement the minimum editor UI needed for:

- `Edit Text on Canvas` and double-click inline editing.
- Properties section buttons.
- Collapsible Export and Version History panels.

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx src/features/exports/tests/export-panel.test.tsx > Docs/tdd/logs/18-inline-edit-organized-panels-green.txt
```

## Acceptance Criteria

- Users can edit text directly on the canvas without opening JSON.
- Position controls are visible only after selecting the Position section.
- Style controls are visible only after selecting the Style section.
- Export formats appear after opening the Export panel.
- Version restore controls appear after opening Version History.
- Saved canvas JSON remains the source of truth.
