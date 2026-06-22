# 31 Editor Text Defaults And Brief Copy TDD Plan

## Goal

Make newly added text readable on the default white canvas, and let users copy each generated creative brief section without manually selecting text.

## Red

- Canvas text creation should default new text elements to black text.
- Generated creative brief output should render one copy-to-clipboard action for each strategy section.
- Clicking a section copy action should copy only that section's generated text.

## Green

- Update the editor canvas text factory to use black text for newly added text.
- Add section-level copy buttons to the generated creative brief panel.
- Use the browser clipboard API when available.

## Verification

- Focused Vitest red and green logs.
- Full Vitest suite.
- TypeScript, lint, and production build.
