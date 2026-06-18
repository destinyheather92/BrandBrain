# 06 Brand Memory TDD Plan

## User Story

As a signed-in BrandBrain user, I can open a brand's memory, edit persistent brand guidance, and save it so future BrandBrain workflows can use stable brand context.

## Acceptance Criteria

- Brand memory requires a signed-in Clerk user synced to a local user record.
- Users can open memory for a brand they own from `/brands`.
- Each brand has one persistent memory record.
- Opening memory creates an initial record only when one does not already exist.
- Existing memory is preserved and never overwritten by automatic initialization.
- Users can edit voice, audience, products/services, brand rules, preferred CTAs, and notes.
- Memory input is validated and normalized before persistence.
- Database access lives in a repository.
- Business logic lives in a service.
- This feature does not implement AI learning, content intelligence, canvas, projects, or generation.

## Red / Green Workflow

1. Write tests for memory initialization, user-edit preservation, update validation, the memory form, and the brand list memory link.
2. Run Vitest and capture the expected failing output in `Docs/tdd/logs/06-brand-memory-red.txt`.
3. Implement the minimum schema, migration, repository, service, action, route, form, and list link required to pass.
4. Re-run Vitest and capture passing output in `Docs/tdd/logs/06-brand-memory-green.txt`.
5. Generate Prisma client, run migrations when approved, then run tests, typecheck, lint, and build.
6. Open `/brands`, choose a brand's memory, edit and save memory, and confirm the saved state remains visible.
7. Stop and wait for approval before moving to feature 7.
