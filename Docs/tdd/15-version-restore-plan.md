# Feature 15: Version Restore TDD Plan

## User Story

As a signed-in BrandBrain user, I can restore a saved version of a project without losing the current version history.

## Scope

- Add an ownership-checked lookup for a project version.
- Restore a selected version's editable canvas JSON to the current project.
- Create a new `version-restore` snapshot when a version is restored.
- Add restore buttons to the editor Version History panel.
- Update the visible editor canvas immediately after restore.

## Out of Scope

- Visual diffs between versions.
- Side-by-side preview modal.
- Restore conflict resolution.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/15-version-restore-red.txt
```

Expected failures:

- Project version repository cannot find a single version yet.
- Restore service/action does not exist yet.
- Version History entries are not actionable restore controls yet.

## Green Phase

Implement the minimum code required for:

- `findForProjectOwner`
- `restoreProjectVersionForUser`
- `restoreProjectVersionAction`
- restore state wiring in the editor
- restore buttons in Version History

Run:

```bash
npm run test -- src/features/projects/tests/project-editor.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/15-version-restore-green.txt
```

## Acceptance Criteria

- Only versions owned by the current user/project can be restored.
- Restoring updates the current project canvas.
- Restoring creates a new `version-restore` entry.
- The editor visually switches to the restored canvas.
- The restored canvas remains editable canvas JSON.
