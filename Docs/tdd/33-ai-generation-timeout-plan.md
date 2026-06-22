# 33 AI Generation Timeout TDD Plan

## Goal

Prevent draft slide generation from leaving users stuck in an endless pending state when OpenAI takes too long to return editable canvas JSON.

## Red

- OpenAI canvas generation should reject with a timeout error when the provider call exceeds the configured wait time.
- The AI generation pipeline should translate provider timeout errors into a user-facing recovery message.

## Green

- Add a timeout option to the OpenAI canvas generation provider.
- Add a provider timeout error class.
- Catch timeout errors in the draft generation pipeline and return a friendly message.

## Verification

- Focused Vitest red and green logs.
- Targeted AI generation tests.
- TypeScript, lint, and production build.
