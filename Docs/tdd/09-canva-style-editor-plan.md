# Feature 09: Canva-Style Editor TDD Plan

## User Story

As a signed-in BrandBrain user, I can open a saved content project in a visual editor, add and edit canvas objects, and manually save those edits back to the project.

## Scope

- Add a protected project editor route.
- Load a project only when it belongs to the current local user.
- Render a Figma/Cursor-inspired editor with slide rail, canvas, toolbar, and properties panel.
- Add editable text, shape, and CTA objects to a slide.
- Select and update object content, position, size, color, and layer data.
- Save validated canvas JSON back to the content project.
- Link saved projects to the editor.

## Out of Scope

- Theme engine.
- AI generation.
- Autosave.
- Version history.
- Templates.
- Export.
- Drag-and-drop precision tooling.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx src/features/projects/tests/content-projects-shell.test.tsx > Docs/tdd/logs/09-canva-style-editor-red.txt
```

Expected failures:

- Editor service functions do not exist yet.
- Editor shell does not exist yet.
- Project cards do not link to the editor yet.

## Green Phase

Implement the minimum code required for:

- `getContentProjectForEditor`
- `saveProjectCanvasForUser`
- project repository `findByIdForOwner` and `updateCanvasForOwner`
- editor canvas object operations
- `ProjectEditorShell`
- `/projects/[projectId]/editor`
- editor save action
- project card `Open Editor` link

Run:

```bash
npm run test -- src/features/projects/tests/project-editor.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx src/features/projects/tests/content-projects-shell.test.tsx > Docs/tdd/logs/09-canva-style-editor-green.txt
```

## Acceptance Criteria

- The editor opens from a saved project card.
- The editor shows slide thumbnails, a central canvas, and object properties.
- Users can add text, shape, and CTA objects visually.
- Users can select an object and edit its content/properties.
- Save rejects invalid canvas JSON.
- Save updates only projects owned by the current user.
