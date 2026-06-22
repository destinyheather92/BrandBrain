# 29 OpenAI Provider Integration TDD Plan

## Goal

Stop silently producing fake AI output. Use the real OpenAI API when `OPENAI_API_KEY` is configured, and fail clearly when it is not.

## Red

- Add OpenAI canvas provider tests proving JSON draft generation calls the OpenAI SDK with JSON mode and parses the model output.
- Add OpenAI image provider tests proving image generation calls the OpenAI SDK and returns a real image URL/data URL.
- Add provider registry tests proving local fallback is opt-in only and missing API keys return a clear provider configuration error.
- Add pipeline tests proving missing provider config surfaces as a user-facing setup error.

## Green

- Implement real OpenAI canvas and image providers.
- Add an AI provider registry that selects OpenAI by default when `OPENAI_API_KEY` exists.
- Keep local fallback only behind an explicit development flag.
- Update server actions to use the provider registry.
- Add OpenAI env keys to `.env.example`.

## Verification

- Focused Vitest red and green logs.
- Full Vitest suite.
- TypeScript, lint, and production build.
