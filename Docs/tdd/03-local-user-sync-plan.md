# 03 Local User Sync TDD Plan

## User Story

As a signed-in BrandBrain user, my Clerk identity is synced to a local database user record so that future brand, project, and ownership features can reference a stable internal user.

## Acceptance Criteria

- A Prisma `users` table contract exists for local users.
- The local user stores Clerk user ID, email, name, avatar URL, and timestamps.
- The sync service validates Clerk user input before saving.
- The sync service upserts by Clerk user ID so repeated dashboard visits update the same local user.
- Repository errors return typed sync failures instead of throwing raw provider errors to UI.
- The protected dashboard attempts sync after Clerk authentication and shows a clear sync status.
- If `DATABASE_URL` is not configured, the dashboard still renders and shows that local sync needs database configuration.
- This feature does not implement brand creation or ownership checks beyond establishing the local user.

## Red / Green Workflow

1. Write tests for Clerk user normalization, local user upsert behavior, validation failure, and repository failure.
2. Run Vitest and capture the expected failing output in `Docs/tdd/logs/03-local-user-sync-red.txt`.
3. Implement the minimum Prisma schema, repository contract, sync service, and dashboard status needed to pass.
4. Re-run Vitest and capture passing output in `Docs/tdd/logs/03-local-user-sync-green.txt`.
5. Run Prisma generate, typecheck, lint, tests, and build.
6. Open `/dashboard` while signed in and visually confirm local sync status.
7. Stop and wait for approval before moving to feature 4.
