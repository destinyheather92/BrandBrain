import type { AiCanvasGenerationProvider, AiGenerationPrompt } from "../types/ai-generation";

type OpenAiChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    } | null;
  }>;
  usage?: {
    total_tokens?: number | null;
  } | null;
};

export type OpenAiCanvasClient = {
  chat: {
    completions: {
      create(input: {
        messages: Array<{
          content: string;
          role: "developer" | "user";
        }>;
        model: string;
        response_format: {
          type: "json_object";
        };
        temperature?: number;
      }): Promise<OpenAiChatCompletionResponse>;
    };
  };
};

type OpenAiCanvasGenerationProviderParams = {
  client: OpenAiCanvasClient;
  model: string;
  timeoutMs?: number;
};

const defaultOpenAiCanvasGenerationTimeoutMs = 45000;

export class OpenAiCanvasGenerationTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`OpenAI canvas generation timed out after ${timeoutMs}ms.`);
    this.name = "OpenAiCanvasGenerationTimeoutError";
  }
}

export class OpenAiCanvasGenerationProvider implements AiCanvasGenerationProvider {
  readonly id = "openai";

  constructor(private readonly params: OpenAiCanvasGenerationProviderParams) {}

  async generateJson(prompt: AiGenerationPrompt) {
    const completion = await withTimeout(
      this.params.client.chat.completions.create({
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
        model: this.params.model,
        response_format: {
          type: "json_object"
        },
        ...getTemperatureRequestOptions(this.params.model, prompt.temperature)
      }),
      this.params.timeoutMs ?? defaultOpenAiCanvasGenerationTimeoutMs
    );
    const content = completion.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("OpenAI returned no canvas JSON.");
    }

    return {
      data: JSON.parse(stripJsonFence(content)) as unknown,
      usage: {
        cost: 0,
        tokens: completion.usage?.total_tokens ?? estimateTokens(prompt.system, prompt.user, content)
      }
    };
  }
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return promise;
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new OpenAiCanvasGenerationTimeoutError(timeoutMs));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });
}

function getTemperatureRequestOptions(model: string, temperature: number): { temperature?: number } {
  if (/^gpt-5(?:\.|-|$)/i.test(model)) {
    return {};
  }

  return {
    temperature
  };
}

function stripJsonFence(value: string): string {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function estimateTokens(...values: string[]): number {
  return Math.ceil(values.join(" ").length / 4);
}
