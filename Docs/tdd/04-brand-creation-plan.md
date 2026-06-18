# 04 Brand Creation TDD Plan

## User Story

As a signed-in BrandBrain user, I can create a brand record so that all future imports, memory, projects, and generation workflows have a brand to belong to.

## Acceptance Criteria

- Brand creation requires a signed-in Clerk user synced to a local user record.
- A Prisma `brands` table contract exists.
- Each brand belongs to one local user.
- Brand input is validated with Zod before persistence.
- Business logic lives in a brand service.
- Database access lives in a brand repository.
- Users can open `/brands/new`, submit a brand name and optional metadata, and be redirected to `/brands`.
- `/brands` lists the signed-in user's created brands.
- This feature does not implement website import, brand memory, templates, projects, or generation.

## Red / Green Workflow

1. Write tests for brand service validation, repository calls, typed failures, and the brand creation form rendering contract.
2. Run Vitest and capture the expected failing output in `Docs/tdd/logs/04-brand-creation-red.txt`.
3. Implement the minimum schema, repository, service, action, pages, and Prisma migration required to pass.
4. Re-run Vitest and capture passing output in `Docs/tdd/logs/04-brand-creation-green.txt`.
5. Generate Prisma client, run migrations when approved, then run tests, typecheck, lint, and build.
6. Open `/brands/new`, create a brand, and confirm it appears on `/brands`.
7. Stop and wait for approval before moving to feature 5.
