# 32 OpenAI Temperature Compatibility TDD Plan

## Goal

Restore AI draft generation for OpenAI models that only support the default temperature.

## Red

- OpenAI canvas generation should omit custom temperature for GPT-5-family models.
- OpenAI canvas generation should still send custom temperature for models that support it.

## Green

- Make the OpenAI chat completion request temperature optional.
- Add model-aware request construction so GPT-5-family models use the provider default temperature.

## Verification

- Focused Vitest red and green logs.
- Targeted AI generation tests.
- TypeScript, lint, and build.
