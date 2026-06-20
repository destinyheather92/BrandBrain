# Feature 13: Templates TDD Plan

## User Story

As a signed-in BrandBrain user, I can choose a reusable content template and turn it into an editable project for one of my brands.

## Scope

- Add a curated template catalog backed by editable canvas JSON.
- Render a protected templates page with template previews.
- Let a user choose one of their brands and create a project from a template.
- Preserve the template as editable canvas objects, not flat images.
- Open the created project in the editor.

## Out of Scope

- User-created custom templates.
- Template marketplace.
- Template analytics.
- Export.

## Red Phase

Run:

```bash
npm run test -- src/features/templates/tests/template-library.service.test.ts src/features/templates/tests/templates-shell.test.tsx > Docs/tdd/logs/13-templates-red.txt
```

Expected failures:

- Template library service does not exist yet.
- Template creation service does not exist yet.
- Templates shell does not exist yet.

## Green Phase

Implement the minimum code required for:

- `listContentTemplates`
- `createProjectFromTemplateForUser`
- `TemplatesShell`
- `/templates` protected page
- `createProjectFromTemplateAction`

Run:

```bash
npm run test -- src/features/templates/tests/template-library.service.test.ts src/features/templates/tests/templates-shell.test.tsx > Docs/tdd/logs/13-templates-green.txt
```

## Acceptance Criteria

- Templates are listed on `/templates`.
- Each template stores validated editable canvas JSON.
- Creating from a template requires a brand owned by the signed-in user.
- The created project opens in the editor.
- Created projects preserve editable canvas elements.
