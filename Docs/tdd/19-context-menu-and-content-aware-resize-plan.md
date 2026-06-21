# 19 Context Menu And Content Aware Resize Plan

## Goal

Make canvas objects feel safer and faster to edit by adding a right-click element menu for deletion and preventing text-based objects from being resized below the content they contain.

## Red

- Add a canvas service test proving text elements keep a content-aware minimum width and height when resized smaller than their copy.
- Add an editor shell test proving right-clicking a canvas object opens an element actions menu and deleting from that menu removes the object from the saved canvas JSON.
- Run:

```bash
npm.cmd test -- src/features/projects/tests/project-editor-canvas.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/19-context-menu-and-content-aware-resize-red.txt
```

## Green

- Replace the generic resize minimum with a content-aware minimum for text and CTA elements.
- Add an element context menu opened from the canvas `contextmenu` event.
- Delete the targeted element from the context menu and clear selection/editing state.
- Re-run:

```bash
npm.cmd test -- src/features/projects/tests/project-editor-canvas.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/19-context-menu-and-content-aware-resize-green.txt
```

## Acceptance

- Right-clicking an element shows a compact Delete action.
- Choosing Delete removes that exact object from the canvas and persisted editor JSON.
- Text and CTA boxes cannot be resized below a practical content floor.
- Existing drag, resize, inline text editing, autosave, export, and version history tests remain green.
