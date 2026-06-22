import OpenAI from "openai";

import type {
  AiCanvasGenerationProvider,
  AiImageGenerationProvider,
  AiImageProviderRegistry,
  AiProviderRegistry
} from "../types/ai-generation";

import { LocalCanvasGenerationProvider } from "./local-canvas-generation.provider";
import { LocalImageGenerationProvider } from "./local-image-generation.provider";
import {
  OpenAiCanvasGenerationProvider,
  type OpenAiCanvasClient
} from "./openai-canvas-generation.provider";
import {
  OpenAiImageGenerationProvider,
  type OpenAiImageClient
} from "./openai-image-generation.provider";

const missingOpenAiKeyMessage = "OPENAI_API_KEY is missing. Add it to .env.local and restart the local server.";
const defaultTextModel = "gpt-5.5";
const defaultImageModel = "gpt-image-1.5";

type AiProviderRegistryOptions = {
  client?: OpenAiCanvasClient;
};

type AiImageProviderRegistryOptions = {
  client?: OpenAiImageClient;
};

export class AiProviderConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiProviderConfigurationError";
  }
}

export function createDefaultAiProviderRegistry(options: AiProviderRegistryOptions = {}): AiProviderRegistry {
  if (isLocalAiEnabled()) {
    const canvasProvider = new LocalCanvasGenerationProvider();

    return {
      getProvider() {
        return canvasProvider;
      }
    };
  }

  const client = options.client ?? createOpenAiClient();

  if (!client) {
    return {
      getProvider() {
        return new MissingCanvasGenerationProvider();
      }
    };
  }

  const canvasProvider = new OpenAiCanvasGenerationProvider({
    client: client as OpenAiCanvasClient,
    model: process.env.OPENAI_TEXT_MODEL?.trim() || defaultTextModel
  });

  return {
    getProvider() {
      return canvasProvider;
    }
  };
}

export function createDefaultAiImageProviderRegistry(
  options: AiImageProviderRegistryOptions = {}
): AiImageProviderRegistry {
  if (isLocalAiEnabled()) {
    const imageProvider = new LocalImageGenerationProvider("local-image");

    return {
      getImageProvider() {
        return imageProvider;
      }
    };
  }

  const client = options.client ?? createOpenAiClient();

  if (!client) {
    return {
      getImageProvider() {
        return new MissingImageGenerationProvider();
      }
    };
  }

  const imageProvider = new OpenAiImageGenerationProvider({
    client: client as OpenAiImageClient,
    model: process.env.OPENAI_IMAGE_MODEL?.trim() || defaultImageModel
  });

  return {
    getImageProvider() {
      return imageProvider;
    }
  };
}

function createOpenAiClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    apiKey
  });
}

function isLocalAiEnabled(): boolean {
  return process.env.BRANDBRAIN_USE_LOCAL_AI === "true";
}

class MissingCanvasGenerationProvider implements AiCanvasGenerationProvider {
  readonly id = "openai";

  generateJson(): ReturnType<AiCanvasGenerationProvider["generateJson"]> {
    return Promise.reject(new AiProviderConfigurationError(missingOpenAiKeyMessage));
  }
}

class MissingImageGenerationProvider implements AiImageGenerationProvider {
  readonly id = "openai";

  generateImage(): ReturnType<AiImageGenerationProvider["generateImage"]> {
    return Promise.reject(new AiProviderConfigurationError(missingOpenAiKeyMessage));
  }
}
