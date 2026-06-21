# Feature 17 Polish: Editor Scroll Lanes TDD Plan

## User Story

As a BrandBrain user editing a project, I can scroll the slide rail and canvas workspace independently while the Properties panel stays reachable.

## Scope

- Give the slide rail an accessible label.
- Give the canvas workspace an accessible label.
- Make the slide rail scroll internally on desktop.
- Make the center canvas area keep its own scrollable workspace on desktop.
- Preserve the internally scrolling inspector rail.

## Out of Scope

- Resizable columns.
- Sticky toolbar redesign.
- Mobile-specific drawer behavior.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-editor-scroll-lanes-red.txt
```

Expected failure:

- Slide rail and canvas workspace do not expose internal-scroll layout classes.

## Green Phase

Update the editor grid columns so each major area owns its scroll behavior.

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-editor-scroll-lanes-green.txt
```

## Acceptance Criteria

- Slide rail scrolls independently on desktop.
- Canvas workspace scrolls independently on desktop.
- Inspector remains viewport-height and internally scrollable.
- The editor route still loads successfully.
