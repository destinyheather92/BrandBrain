# 28 Creative Brief Builder TDD Plan

## Goal

Make BrandBrain generate a visible creative brief before draft slides so vague prompts become a clear, brand-specific strategy that the user can review and the AI draft pipeline can use.

## Red

- Add service tests proving a vague counseling prompt becomes a counseling-specific brief with no unrelated land-management language.
- Add panel tests proving the editor exposes a Creative Brief step and renders generated brief fields.
- Add prompt tests proving draft slide generation receives the approved brief as explicit context.
- Add editor shell tests proving the brief builder appears before theme and AI slide generation.

## Green

- Implement a typed creative brief result and action state.
- Implement deterministic local brief generation from brand, memory, project title, and user request.
- Add a Creative Brief panel to the editor inspector.
- Pass the generated brief into AI slide generation form data and the canvas prompt.
- Teach the local canvas fallback to use the brief for audience, angle, hook, and CTA.

## Verification

- Focused Vitest red and green logs.
- Full Vitest suite.
- Typecheck, lint, and production build.
- Local browser URL for visual approval.
