# Feature 17 Polish: Inspector Viewport Height TDD Plan

## User Story

As a BrandBrain user editing a canvas object, I can keep the canvas in view while adjusting properties because the inspector rail fits the viewport and scrolls internally.

## Scope

- Give the editor inspector an accessible label.
- Make the right rail use the viewport height below the header on desktop.
- Let the inspector content scroll internally.
- Tighten the rail padding so controls are easier to reach.

## Out of Scope

- Resizable panels.
- Collapsible sections.
- Moving controls between panels.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-inspector-viewport-height-red.txt
```

Expected failure:

- The inspector rail is not labelled and does not expose viewport-height/internal-scroll classes.

## Green Phase

Update the editor inspector rail layout.

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-inspector-viewport-height-green.txt
```

## Acceptance Criteria

- The inspector rail is identifiable as `Editor inspector`.
- On desktop, the inspector height is the viewport below the header.
- Inspector content scrolls inside the right rail instead of pushing the whole editor page.
- The editor route still loads successfully.
