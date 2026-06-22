# 35 Brand Palette, Readability, and Image Upload Plan

## User Story

As a BrandBrain user, I need to define my brand color palette directly, trust generated themes to keep text readable, and upload my own images into the editor canvas.

## Acceptance Criteria

- Brand memory includes direct color palette controls for primary, accent, background, and text color.
- Theme generation prioritizes saved brand palette values over inferred or fallback colors.
- Theme generation repairs unreadable text and CTA color combinations before storing the theme.
- The editor can upload an image from the user's computer and insert it as an editable canvas image object on the active slide.

## TDD Steps

1. Add failing tests for palette controls, readable theme generation, and canvas image upload.
2. Capture red test output in `Docs/tdd/logs/35-brand-palette-upload-readability-red.txt`.
3. Implement the smallest code changes needed to pass.
4. Capture green test output in `Docs/tdd/logs/35-brand-palette-upload-readability-green.txt`.
5. Visually confirm the brand memory page and editor behavior in the browser before continuing.
