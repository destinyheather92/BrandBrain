# Feature 17: Font and Style Controls TDD Plan

## User Story

As a BrandBrain user editing a project, I can adjust typography and visual styling from the inspector without editing JSON.

## Scope

- Add text typography controls for font family, weight, alignment, line height, and letter spacing.
- Add shared object controls for opacity and rotation.
- Add CTA typography controls for font family and font size.
- Add shape style controls for corner radius, stroke color, and stroke width.
- Keep the editable canvas JSON as the source of truth.

## Out of Scope

- Custom font uploads.
- Full rich text editing inside one text box.
- Multi-select style application.
- Keyboard shortcuts.

## Red Phase

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-font-style-controls-red.txt
```

Expected failures:

- Font family, weight, alignment, spacing, opacity, and rotation controls are not present for text.
- CTA font controls are not present.
- Shape radius and stroke controls are not present.

## Green Phase

Implement the minimum inspector controls required to update the selected canvas object:

- `Font Family`
- `Weight`
- `Align center`
- `Line Height`
- `Letter Spacing`
- `Opacity`
- `Rotation`
- `Font Size`
- `Corner Radius`
- `Stroke Color`
- `Stroke Width`

Run:

```bash
npm run test -- src/features/projects/tests/project-editor-shell.test.tsx > Docs/tdd/logs/17-font-style-controls-green.txt
```

## Acceptance Criteria

- A user can change text typography without touching JSON.
- A user can change CTA typography without touching JSON.
- A user can adjust common object opacity and rotation.
- A user can style shape radius and stroke.
- All changes update the hidden canvas JSON used by save and autosave.
