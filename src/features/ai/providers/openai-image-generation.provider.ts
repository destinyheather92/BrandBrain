import type { AiImageGenerationPrompt, AiImageGenerationProvider } from "../types/ai-generation";

type OpenAiImageResponse = {
  data?: Array<{
    b64_json?: string;
    url?: string;
  }>;
};

export type OpenAiImageClient = {
  images: {
    generate(input: {
      model: string;
      prompt: string;
      quality: "high";
      size: "1024x1024";
    }): Promise<OpenAiImageResponse>;
  };
};

type OpenAiImageGenerationProviderParams = {
  client: OpenAiImageClient;
  model: string;
};

export class OpenAiImageGenerationProvider implements AiImageGenerationProvider {
  readonly id = "openai";

  constructor(private readonly params: OpenAiImageGenerationProviderParams) {}

  async generateImage(prompt: AiImageGenerationPrompt) {
    const response = await this.params.client.images.generate({
      model: this.params.model,
      prompt: buildImagePrompt(prompt),
      quality: "high",
      size: "1024x1024"
    });
    const image = response.data?.[0];
    const imageUrl = image?.b64_json ? `data:image/png;base64,${image.b64_json}` : image?.url;

    if (!imageUrl) {
      throw new Error("OpenAI returned no generated image.");
    }

    return {
      imageUrl,
      usage: {
        cost: 0,
        tokens: estimateTokens(prompt.system, prompt.prompt, prompt.negativePrompt)
      }
    };
  }
}

function buildImagePrompt(prompt: AiImageGenerationPrompt): string {
  return [
    prompt.system,
    prompt.prompt,
    prompt.negativePrompt ? `Avoid: ${prompt.negativePrompt}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}

function estimateTokens(...values: string[]): number {
  return Math.ceil(values.join(" ").length / 4);
}
