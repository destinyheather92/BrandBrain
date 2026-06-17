# 01 Clerk Authentication TDD Plan

## User Story

As a BrandBrain user, I can reach premium BrandBrain sign-in and sign-up pages powered by Clerk so that all future product areas can rely on authenticated identity.

## Acceptance Criteria

- The app uses Next.js App Router, React, TypeScript strict mode, Tailwind CSS, and Clerk.
- Clerk is mounted globally through the root app layout.
- Sign-in is available at `/sign-in`.
- Sign-up is available at `/sign-up`.
- Auth routes use BrandBrain's locked dark graphite and electric cyan visual system.
- The implementation does not create a dashboard or protected app area yet.
- Missing Clerk environment keys produce a clear setup state instead of a runtime crash.
- Tests cover route configuration and the auth shell rendering contract.

## Red / Green Workflow

1. Write tests for auth route configuration and auth shell rendering.
2. Run Vitest and capture the expected failing output in `Docs/tdd/logs/01-clerk-authentication-red.txt`.
3. Implement the minimum auth routes, shell components, Clerk provider wiring, and env fallback needed to pass.
4. Re-run Vitest and capture passing output in `Docs/tdd/logs/01-clerk-authentication-green.txt`.
5. Run typecheck, lint, and build.
6. Start the local app and visually verify `/sign-in` and `/sign-up`.
7. Stop and wait for approval before moving to feature 2.
