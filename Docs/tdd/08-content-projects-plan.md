# Feature 08: Content Projects TDD Plan

## User Story

As a signed-in BrandBrain user, I can create and reopen saved content projects attached to one of my brands so every generation has a durable editable home.

## Scope

- Add a `ContentProject` database model.
- Store the editable canvas document JSON as the project source of truth.
- Connect each project to a local user and brand.
- Validate project creation input and canvas JSON before saving.
- List a user's projects on a protected `/projects` page.
- Let users create a starter carousel project from an existing brand.

## Out of Scope

- AI generation.
- Theme generation.
- Canva-style editor controls.
- Autosave/version history.
- Templates.
- Export.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/content-project.service.test.ts src/features/projects/tests/content-projects-shell.test.tsx src/features/auth/tests/protected-route.service.test.ts > Docs/tdd/logs/08-content-projects-red.txt
```

Expected failures:

- Project schemas, service, types, and shell do not exist yet.
- `/projects` is not protected yet.

## Green Phase

Implement the minimum code required for:

- `contentProjectSchema`
- `createContentProjectForUser`
- Prisma repository
- `/projects` page and creation action
- `ContentProjectsShell`
- `/projects` route protection

Run:

```bash
npm run test -- src/features/projects/tests/content-project.service.test.ts src/features/projects/tests/content-projects-shell.test.tsx src/features/auth/tests/protected-route.service.test.ts > Docs/tdd/logs/08-content-projects-green.txt
```

## Acceptance Criteria

- Projects belong to both a user and brand.
- Users cannot create projects for brands they do not own.
- New projects store validated editable canvas JSON.
- Project list shows saved projects and associated brand names.
- Empty state guides users to create or import a brand first.
- `/projects` is protected by Clerk middleware.
