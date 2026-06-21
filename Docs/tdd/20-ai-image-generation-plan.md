# 20 AI Image Generation Plan

## Goal

Add AI image generation to the editor without breaking BrandBrain's core rule that projects remain editable canvas JSON.

## Red

- Add prompt tests for Workflow 7 Image Prompt Generation.
- Add service tests proving a generated image is inserted as an editable `image` canvas object, not a flat slide.
- Add editor panel tests proving users can request an image for the active slide.
- Add canvas/export tests proving generated image sources validate, render in the editor, and appear in exports.
- Run:

```bash
npm.cmd test -- src/features/ai/tests/image-generation.prompt.test.ts src/features/ai/tests/ai-image-generation.service.test.ts src/features/ai/tests/ai-image-generation-panel.test.tsx src/features/canvas/tests/canvas-object-model.service.test.ts src/features/exports/tests/canvas-export.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/20-ai-image-generation-red.txt
```

## Green

- Add structured image prompt construction with provider routing.
- Add a local image provider fallback that returns deterministic SVG data images when vendor APIs are not configured.
- Add an image generation service and server action.
- Extend canvas image objects with renderable source and generation metadata.
- Render image objects in the editor and SVG export.
- Add an AI Image panel to the editor right rail.
- Re-run:

```bash
npm.cmd test -- src/features/ai/tests/image-generation.prompt.test.ts src/features/ai/tests/ai-image-generation.service.test.ts src/features/ai/tests/ai-image-generation-panel.test.tsx src/features/canvas/tests/canvas-object-model.service.test.ts src/features/exports/tests/canvas-export.service.test.ts src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/20-ai-image-generation-green.txt
```

## Acceptance

- The editor exposes an AI Image section.
- A user can generate a brand-aware image for the active slide.
- The generated image appears as a selectable, draggable, resizable canvas object.
- The canvas JSON stores the image source, provider, prompt, and alt text.
- Exports include generated image elements.
- Missing vendor keys do not block founder testing because the local fallback still creates a visual image object.
