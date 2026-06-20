# Feature 17 Polish: Properties Panel Priority TDD Plan

## User Story

As a BrandBrain user adjusting canvas objects, I can see the Properties panel first in the right rail so style changes are easy to view and make.

## Scope

- Move the Properties panel above Theme Engine in the editor sidebar.
- Keep Theme Engine, AI generation, export, and version history available below it.
- Preserve all existing properties controls and canvas JSON behavior.

## Out of Scope

- Collapsible panels.
- Persistent sidebar preferences.
- New style controls.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-properties-panel-priority-red.txt
```

Expected failure:

- The DOM places Theme Engine before Properties.

## Green Phase

Move the Properties panel to the top of the right rail.

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-properties-panel-priority-green.txt
```

## Acceptance Criteria

- Properties appears above Theme Engine.
- Existing editor interactions still pass.
- The editor route still loads successfully.
