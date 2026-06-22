# 21 Asset Library Plan

## Goal

Add a protected asset library where generated and upload-ready brand assets can be browsed, reused, and audited without flattening editable projects.

## Red

- Add service tests for listing owner-scoped assets and recording generated image assets.
- Add shell tests for the protected asset library UI, upload-ready state, and empty state.
- Extend the AI image generation service test so generated images are also stored as reusable assets.
- Run:

```bash
npm.cmd test -- src/features/assets/tests/asset-library.service.test.ts src/features/assets/tests/assets-shell.test.tsx src/features/ai/tests/ai-image-generation.service.test.ts > Docs/tdd/logs/21-asset-library-red.txt
```

## Green

- Add an `Asset` Prisma model with owner, brand, project, source, provider, and prompt metadata.
- Add asset schemas, repository, service, and protected `/assets` page.
- Add an asset library shell with a quiet dark UI, upload-ready panel, and asset cards.
- Record AI-generated images in the asset library when generation succeeds.
- Re-run:

```bash
npm.cmd test -- src/features/assets/tests/asset-library.service.test.ts src/features/assets/tests/assets-shell.test.tsx src/features/ai/tests/ai-image-generation.service.test.ts > Docs/tdd/logs/21-asset-library-green.txt
```

## Acceptance

- `/assets` is protected and renders for signed-in users.
- Assets are owner-scoped.
- Generated images appear in the asset library with provider and project context.
- Empty library state is clear.
- UploadThing readiness is represented without pretending live upload keys are configured.
