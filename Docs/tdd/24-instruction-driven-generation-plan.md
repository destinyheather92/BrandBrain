# Feature 24: Instruction-Driven Generation TDD Plan

## User Story

As a BrandBrain user, I can paste the full ChatGPT/Canva build response I would normally recreate by hand, and BrandBrain turns that detailed direction into editable slides using the brand palette and slide flow from the response instead of only using my original prompt.

## Acceptance Criteria

- The AI generation panel asks for detailed design instructions or a ChatGPT/Canva response, not a short generic prompt.
- Canvas generation prompts make the pasted instructions the primary source of truth for slide flow, layout, typography, palette, spacing, visual references, and CTA direction.
- Local generation extracts slide-specific headlines and body copy from pasted instructions.
- Explicit colors in pasted instructions override generic theme defaults for the generated draft.
- Website import detects useful inline website palette colors and includes them in the imported brand profile so theme generation can prioritize actual brand colors.
- BrandBrain design system colors are ignored as imported palette hints unless the imported brand is BrandBrain.

## Red

Run:

```bash
npm.cmd test -- src/features/ai/tests/canvas-generation.prompt.test.ts src/features/ai/tests/local-canvas-generation.provider.test.ts src/features/brands/tests/website-import.service.test.ts > Docs/tdd/logs/24-instruction-driven-generation-red.txt
```

Expected failures before implementation:

- Prompt does not identify detailed instructions as the source of truth.
- Local canvas provider does not extract slide-by-slide response content or pasted palette colors.
- Website import does not detect palette colors from inline website styles.

## Green

Run:

```bash
npm.cmd test -- src/features/ai/tests/canvas-generation.prompt.test.ts src/features/ai/tests/local-canvas-generation.provider.test.ts src/features/brands/tests/website-import.service.test.ts > Docs/tdd/logs/24-instruction-driven-generation-green.txt
```

Expected result:

- All focused tests pass.
- Full typecheck, test, lint, and build pass before commit.
