# 30 Content Format And Slide Count TDD Plan

## Goal

Stop assuming every project is a three-slide Instagram carousel. Let users choose content format and slide count at project creation, and let AI draft generation request an editable slide count.

## Red

- Project creation service should build the selected canvas format and requested number of slides.
- Project creation UI should expose content type and slide count controls.
- AI generation panel should submit requested slide count and avoid hardcoded "3-slide" language.
- AI pipeline should pass requested slide count into the prompt and replace unedited starter slides with the requested number of generated slides.
- Local canvas provider should honor requested format and slide count.

## Green

- Add `slideCount` to project creation schema/action/service.
- Add content type and slide count controls to project creation.
- Add slide count control to AI generation panel and server action.
- Include format and slide count in canvas generation prompts.
- Update merge logic to support generated slide counts when starter slides are unedited.
- Update local provider to use requested format dimensions and allow one-slide content.

## Verification

- Focused Vitest red and green logs.
- Full Vitest suite.
- TypeScript, lint, and production build.
