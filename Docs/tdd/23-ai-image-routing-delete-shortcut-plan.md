# 23 AI Image Routing and Delete Shortcut Plan

## Goal

Make AI image generation feel like BrandBrain is directing the right agent behind the scenes, and let users delete selected canvas elements with familiar keyboard shortcuts.

## Red

- Remove visible provider choice from the AI image panel test.
- Add provider-routing tests aligned to product discovery:
  - Ideogram for social graphics, carousel covers, and text-heavy designs.
  - Flux for marketing photography and product mockups.
  - Imagen for consistent brand imagery and campaigns.
- Add an editor test for deleting the selected element with `Delete`.
- Add local image fallback coverage so generated previews include brand/request context without exposing provider names.
- Run:

```bash
npm.cmd test -- src/features/ai/tests/ai-image-generation-panel.test.tsx src/features/ai/tests/image-generation.prompt.test.ts src/features/ai/tests/local-image-generation.provider.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/23-ai-image-routing-delete-shortcut-red.txt
```

## Green

- Hide provider selection from the user-facing AI image panel.
- Route providers automatically inside the prompt builder using BrandBrain discovery rules.
- Strengthen image prompts to avoid generic placeholder output.
- Ignore forged provider form fields in the server action.
- Add global `Delete`/`Backspace` shortcut for selected canvas elements while preserving text input editing.
- Make the local fallback preview brand/request-aware instead of a provider-labeled placeholder.
- Re-run:

```bash
npm.cmd test -- src/features/ai/tests/ai-image-generation-panel.test.tsx src/features/ai/tests/image-generation.prompt.test.ts src/features/ai/tests/local-image-generation.provider.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/23-ai-image-routing-delete-shortcut-green.txt
```

## Acceptance

- Users only see an image prompt field and generate button.
- BrandBrain chooses the internal image provider automatically.
- Generated prompts include brand, theme, subject, composition, and anti-generic guidance.
- Selected canvas elements can be deleted with `Delete` or `Backspace`.
