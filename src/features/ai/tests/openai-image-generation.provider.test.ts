import { describe, expect, it, vi } from "vitest";

import { OpenAiImageGenerationProvider } from "../providers/openai-image-generation.provider";
import type { AiImageGenerationPrompt } from "../types/ai-generation";

const prompt: AiImageGenerationPrompt = {
  negativePrompt: "No off-brand text.",
  prompt: "Create calm counseling photography with warm natural light.",
  provider: "openai",
  system: "Return image generation instructions.",
  temperature: 0.4,
  user: JSON.stringify({
    brand: {
      name: "Steady Path Counseling"
    }
  }),
  workflow: "image-generation"
};

describe("OpenAiImageGenerationProvider", () => {
  it("calls OpenAI image generation and returns a PNG data URL", async () => {
    const generate = vi.fn().mockResolvedValue({
      data: [
        {
          b64_json: "abc123"
        }
      ]
    });
    const provider = new OpenAiImageGenerationProvider({
      client: {
        images: {
          generate
        }
      },
      model: "gpt-image-test"
    });

    const result = await provider.generateImage(prompt);

    expect(provider.id).toBe("openai");
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gpt-image-test",
        prompt: expect.stringContaining("Create calm counseling photography"),
        quality: "high",
        size: "1024x1024"
      })
    );
    expect(result.imageUrl).toBe("data:image/png;base64,abc123");
    expect(result.usage.tokens).toBeGreaterThan(0);
  });

  it("supports URL image responses when OpenAI returns one", async () => {
    const provider = new OpenAiImageGenerationProvider({
      client: {
        images: {
          generate: vi.fn().mockResolvedValue({
            data: [
              {
                url: "https://cdn.example.com/generated.png"
              }
            ]
          })
        }
      },
      model: "gpt-image-test"
    });

    const result = await provider.generateImage(prompt);

    expect(result.imageUrl).toBe("https://cdn.example.com/generated.png");
  });
});
