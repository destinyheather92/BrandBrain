# Feature 27: Brand-Specific Image Generation TDD Plan

## User Story

As a BrandBrain user, when I generate an image for a counseling slide, BrandBrain should use the current brand, voice, slide content, and mental-health context instead of producing the same generic BrandBrain/LandStrong-style placeholder.

## Acceptance Criteria

- The image generation prompt includes active slide context so the default "for this slide" request has an actual subject.
- The prompt forbids unrelated brand/domain carryover.
- Counseling/mental-health brands produce calm, supportive visual direction.
- Local fallback image previews are domain-aware and no longer render the same abstract card for every brand.
- Counseling fallback previews do not mention land clearing, grading, drainage, access paths, equipment, property prep, or LandStrong unless those belong to the current brand/request.

## Red

Run:

```bash
npm.cmd test -- src/features/ai/tests/local-image-generation.provider.test.ts src/features/ai/tests/image-generation.prompt.test.ts src/features/ai/tests/ai-image-generation.service.test.ts src/features/ai/tests/ai-image-generation-panel.test.tsx > Docs/tdd/logs/27-brand-specific-image-generation-red.txt
```

Expected failures before implementation:

- Local fallback image preview still renders a generic placeholder scene.
- Image prompt does not include active slide context.
- Image generation panel still defaults to a vague "brand-consistent image" request.

## Green

Run:

```bash
npm.cmd test -- src/features/ai/tests/local-image-generation.provider.test.ts src/features/ai/tests/image-generation.prompt.test.ts src/features/ai/tests/ai-image-generation.service.test.ts src/features/ai/tests/ai-image-generation-panel.test.tsx > Docs/tdd/logs/27-brand-specific-image-generation-green.txt
```

Expected result:

- Focused tests pass.
- Full typecheck, test, lint, and build pass before commit.
