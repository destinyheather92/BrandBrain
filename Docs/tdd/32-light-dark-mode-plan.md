# 32 Light and Dark Mode TDD Plan

## User Story

As a BrandBrain user, I want a visible light/dark mode toggle so I can choose the app chrome theme while preserving my editable canvas artwork exactly as project data defines it.

## Source-of-Truth Notes

- BrandBrain defaults to the locked dark premium design system.
- The UI should keep a Linear/Vercel/Figma/Cursor feel.
- Generated and edited slides are stored as editable canvas JSON.
- App chrome theme must not rewrite canvas JSON, slide backgrounds, or theme-controlled artwork colors.

## Acceptance Criteria

- App theme defaults to dark mode.
- User can switch to light mode from a visible app UI toggle.
- Selected mode persists in `localStorage`.
- Selected mode is restored on the next render/reload.
- App root receives an app-level theme attribute/class for styling.
- Canvas slide background remains controlled by `project.canvasJson`, not the app theme mode.

## Test Plan

- Unit/component tests for the app theme provider and toggle:
  - default dark mode
  - switch to light mode
  - persist selected mode to `localStorage`
  - restore selected mode from `localStorage`
  - toggle is visible in dashboard app UI
- Editor integration test:
  - switching app theme does not change the saved canvas JSON slide background.

## TDD Steps

1. Write failing tests first.
2. Run focused tests and save output to `Docs/tdd/logs/32-light-dark-mode-red.txt`.
3. Implement theme provider, toggle, app root theme attribute, localStorage persistence, and CSS theme variables.
4. Re-run focused tests and save output to `Docs/tdd/logs/32-light-dark-mode-green.txt`.
5. Run full verification: `npm.cmd test`, `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build`.
6. Commit and push the plan, logs, tests, and implementation together.
