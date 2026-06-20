# Feature 12: Autosave and Versioning TDD Plan

## User Story

As a signed-in BrandBrain user, my editor changes autosave without breaking my flow, and every saved state becomes a version I can review later.

## Scope

- Add project version persistence for editable canvas JSON snapshots.
- Record versions for autosave and manual project saves.
- Autosave canvas changes from the editor after user edits.
- Show autosave status in the editor.
- Show recent project versions in the editor side panel.
- Keep every version as editable canvas JSON, not flat images.

## Out of Scope

- Full restore-from-version workflow.
- Visual diffing between versions.
- Multi-user conflict resolution.
- Export.
- Templates.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/12-autosave-versioning-red.txt
```

Expected failures:

- Project version repository/types do not exist yet.
- Autosave service does not exist yet.
- Manual save does not record versions yet.
- Editor shell does not accept autosave/version props yet.
- Version history panel does not render yet.

## Green Phase

Implement the minimum code required for:

- `ProjectVersion` model and Prisma migration.
- Prisma project version repository.
- Autosave action/service.
- Manual-save version snapshots.
- Editor autosave debounce/status.
- Recent version history panel.

Run:

```bash
npm run test -- src/features/projects/tests/project-editor.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/12-autosave-versioning-green.txt
```

## Acceptance Criteria

- Editing the canvas schedules an autosave.
- Autosave validates canvas JSON before saving.
- Autosave updates the project canvas and creates a project version.
- Manual save also creates a project version.
- Recent versions are visible in the editor.
- Versions store editable canvas JSON.
