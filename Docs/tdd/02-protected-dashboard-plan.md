# 02 Protected Dashboard TDD Plan

## User Story

As a signed-in BrandBrain user, I can open a protected dashboard so that future brand, project, and editor features have a secure home.

## Acceptance Criteria

- `/dashboard` is protected by Clerk.
- Unauthenticated visitors are redirected by Clerk to sign in.
- Authenticated users can see a BrandBrain dashboard shell.
- The dashboard displays clear signed-in account controls.
- The dashboard does not implement local user sync, brand creation, projects, templates, or editor functionality yet.
- The visual style follows the locked BrandBrain design system.

## Red / Green Workflow

1. Write tests for protected dashboard route configuration and the dashboard shell rendering contract.
2. Run Vitest and capture the expected failing output in `Docs/tdd/logs/02-protected-dashboard-red.txt`.
3. Implement the minimum dashboard route protection and dashboard shell required to pass.
4. Re-run Vitest and capture passing output in `Docs/tdd/logs/02-protected-dashboard-green.txt`.
5. Run typecheck, lint, and build.
6. Start the local app and visually verify `/dashboard`.
7. Stop and wait for approval before moving to feature 3.
