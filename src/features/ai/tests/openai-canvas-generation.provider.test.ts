import { afterEach, describe, expect, it, vi } from "vitest";

import {
  OpenAiCanvasGenerationProvider,
  OpenAiCanvasGenerationTimeoutError
} from "../providers/openai-canvas-generation.provider";
import type { AiGenerationPrompt } from "../types/ai-generation";

const prompt: AiGenerationPrompt = {
  system: "Return valid JSON only.",
  temperature: 0.3,
  user: JSON.stringify({
    projectTitle: "Quality Carousel"
  }),
  workflow: "canvas-generation"
};

afterEach(() => {
  vi.useRealTimers();
});

describe("OpenAiCanvasGenerationProvider", () => {
  it("calls OpenAI chat completions with JSON mode and parses the result", async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              documentId: "document_openai",
              slides: []
            })
          }
        }
      ],
      usage: {
        total_tokens: 321
      }
    });
    const provider = new OpenAiCanvasGenerationProvider({
      client: {
        chat: {
          completions: {
            create
          }
        }
      },
      model: "gpt-test"
    });

    const result = await provider.generateJson(prompt);

    expect(provider.id).toBe("openai");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          {
            content: prompt.system,
            role: "developer"
          },
          {
            content: prompt.user,
            role: "user"
          }
        ],
        model: "gpt-test",
        response_format: {
          type: "json_object"
        },
        temperature: 0.3
      })
    );
    expect(result).toEqual({
      data: {
        documentId: "document_openai",
        slides: []
      },
      usage: {
        cost: 0,
        tokens: 321
      }
    });
  });

  it("fails when OpenAI returns no JSON content", async () => {
    const provider = new OpenAiCanvasGenerationProvider({
      client: {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: ""
                  }
                }
              ],
              usage: {
                total_tokens: 12
              }
            })
          }
        }
      },
      model: "gpt-test"
    });

    await expect(provider.generateJson(prompt)).rejects.toThrow("OpenAI returned no canvas JSON.");
  });

  it("omits custom temperature for GPT-5-family models that only support the default", async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              documentId: "document_openai",
              slides: []
            })
          }
        }
      ],
      usage: {
        total_tokens: 321
      }
    });
    const provider = new OpenAiCanvasGenerationProvider({
      client: {
        chat: {
          completions: {
            create
          }
        }
      },
      model: "gpt-5.5"
    });

    await provider.generateJson(prompt);

    expect(create).toHaveBeenCalledWith(
      expect.not.objectContaining({
        temperature: expect.any(Number)
      })
    );
  });

  it("rejects with a timeout error when OpenAI takes too long", async () => {
    vi.useFakeTimers();

    const provider = new OpenAiCanvasGenerationProvider({
      client: {
        chat: {
          completions: {
            create: vi.fn(() => new Promise<never>(() => undefined))
          }
        }
      },
      model: "gpt-test",
      timeoutMs: 1000
    });
    const generation = provider.generateJson(prompt);
    const expectation = expect(generation).rejects.toBeInstanceOf(OpenAiCanvasGenerationTimeoutError);

    await vi.advanceTimersByTimeAsync(1000);
    await expectation;
  });
});
