# Feature 16: Canvas Drag, Move, and Resize TDD Plan

## User Story

As a BrandBrain user editing a project, I can move and resize objects directly on the canvas instead of relying only on numeric fields.

## Scope

- Add clamp-safe canvas object move behavior.
- Add clamp-safe canvas object resize behavior.
- Support direct pointer dragging on selected canvas objects.
- Support a resize handle on selected canvas objects.
- Preserve editable canvas JSON as the source of truth.

## Out of Scope

- Multi-select.
- Rotation handles.
- Alignment guides.
- Keyboard nudging.
- Mobile touch optimization beyond pointer events.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-canvas.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/16-canvas-drag-resize-red.txt
```

Expected failures:

- Move/resize canvas helpers do not exist yet.
- Editor canvas layers do not respond to pointer drag yet.
- Selected objects do not show resize handles yet.

## Green Phase

Implement the minimum code required for:

- `moveCanvasElementInSlide`
- `resizeCanvasElementInSlide`
- pointer move behavior in the editor canvas
- active-object resize handle

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-canvas.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/16-canvas-drag-resize-green.txt
```

## Acceptance Criteria

- Dragging an object moves it on the canvas.
- Dragging the resize handle changes object width/height.
- Move and resize operations update the saved canvas JSON.
- Objects stay inside the slide bounds.
- Object dimensions keep a usable minimum size.
