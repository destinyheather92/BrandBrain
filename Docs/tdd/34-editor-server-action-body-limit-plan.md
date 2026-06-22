# 34 Editor Server Action Body Limit TDD Plan

## Goal

Stop editor actions from failing when an editable canvas includes large image-backed elements.

## Red

- Next.js configuration should allow editor server actions to submit canvas JSON payloads larger than the default 1 MB limit.

## Green

- Configure `serverActions.bodySizeLimit` in `next.config.ts`.

## Verification

- Focused Vitest red and green logs.
- TypeScript, lint, and production build.
