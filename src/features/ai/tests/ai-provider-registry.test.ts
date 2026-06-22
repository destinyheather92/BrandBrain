import { afterEach, describe, expect, it } from "vitest";

import {
  createDefaultAiImageProviderRegistry,
  createDefaultAiProviderRegistry
} from "../providers/ai-provider-registry";
import type { AiGenerationPrompt, AiImageGenerationPrompt } from "../types/ai-generation";

const originalEnv = process.env;

const canvasPrompt: AiGenerationPrompt = {
  system: "Return JSON.",
  temperature: 0.3,
  user: "{}",
  workflow: "canvas-generation"
};

const imagePrompt: AiImageGenerationPrompt = {
  negativePrompt: "",
  prompt: "Generate an image.",
  provider: "flux",
  system: "",
  temperature: 0.4,
  user: "{}",
  workflow: "image-generation"
};

afterEach(() => {
  process.env = originalEnv;
});

describe("AI provider registry", () => {
  it("fails clearly when OpenAI is not configured", async () => {
    process.env = {
      ...originalEnv,
      BRANDBRAIN_USE_LOCAL_AI: "",
      OPENAI_API_KEY: ""
    };

    const canvasProvider = createDefaultAiProviderRegistry().getProvider("canvas-generation");
    const imageProvider = createDefaultAiImageProviderRegistry().getImageProvider("flux");

    await expect(canvasProvider.generateJson(canvasPrompt)).rejects.toThrow("OPENAI_API_KEY is missing");
    await expect(imageProvider.generateImage(imagePrompt)).rejects.toThrow("OPENAI_API_KEY is missing");
  });

  it("uses the local providers only when the local AI flag is explicitly enabled", async () => {
    process.env = {
      ...originalEnv,
      BRANDBRAIN_USE_LOCAL_AI: "true",
      OPENAI_API_KEY: ""
    };

    const canvasProvider = createDefaultAiProviderRegistry().getProvider("canvas-generation");
    const imageProvider = createDefaultAiImageProviderRegistry().getImageProvider("flux");

    expect(canvasProvider.id).toBe("local-canvas");
    expect(imageProvider.id).toBe("local-image");
  });

  it("selects OpenAI providers when OPENAI_API_KEY is present", () => {
    process.env = {
      ...originalEnv,
      BRANDBRAIN_USE_LOCAL_AI: "",
      OPENAI_API_KEY: "sk-test"
    };

    expect(
      createDefaultAiProviderRegistry({
        client: {
          chat: {
            completions: {
              create: async () => ({
                choices: []
              })
            }
          }
        }
      }).getProvider("canvas-generation").id
    ).toBe("openai");
    expect(
      createDefaultAiImageProviderRegistry({
        client: {
          images: {
            generate: async () => ({
              data: []
            })
          }
        }
      }).getImageProvider("flux").id
    ).toBe("openai");
  });
});
