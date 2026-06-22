"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPrismaAssetRepository } from "@/features/assets/repositories/prisma-asset.repository";
import { createPrismaBrandMemoryRepository } from "@/features/brands/repositories/prisma-brand-memory.repository";
import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import { createPrismaProjectThemeRepository } from "@/features/themes/repositories/prisma-project-theme.repository";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createDefaultAiImageProviderRegistry } from "../providers/local-image-generation.provider";
import { createPrismaGenerationCostRepository } from "../repositories/prisma-generation-cost.repository";
import { generateProjectImageForUser } from "../services/ai-image-generation.service";
import type { AiImageGenerationActionState } from "../types/ai-image-generation-action-state";
import type { AiImageProviderPreference } from "../types/ai-generation";

const imageProviderPreferences = new Set<AiImageProviderPreference>(["auto", "flux", "ideogram", "imagen", "openai"]);

export async function generateProjectImageAction(
  _previousState: AiImageGenerationActionState,
  formData: FormData
): Promise<AiImageGenerationActionState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const projectId = formData.get("projectId");
  const slideId = formData.get("slideId");
  const userRequest = formData.get("userRequest");
  const preferredProviderValue = formData.get("preferredProvider");
  const preferredProvider =
    typeof preferredProviderValue === "string" && imageProviderPreferences.has(preferredProviderValue as AiImageProviderPreference)
      ? (preferredProviderValue as AiImageProviderPreference)
      : "auto";

  if (typeof projectId !== "string" || typeof slideId !== "string" || typeof userRequest !== "string") {
    return {
      canvasJson: null,
      message: "AI image could not be generated.",
      status: "error"
    };
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return {
      canvasJson: null,
      message: syncResult.error.message,
      status: "error"
    };
  }

  const result = await generateProjectImageForUser({
    assetRepository: createPrismaAssetRepository(),
    brandMemoryRepository: createPrismaBrandMemoryRepository(),
    brandRepository: createPrismaBrandRepository(),
    generationCostRepository: createPrismaGenerationCostRepository(),
    imageProviderRegistry: createDefaultAiImageProviderRegistry(),
    ownerUserId: syncResult.user.id,
    preferredProvider,
    projectId,
    projectRepository: createPrismaContentProjectRepository(),
    slideId,
    themeRepository: createPrismaProjectThemeRepository(),
    userRequest
  });

  if (!result.ok) {
    return {
      canvasJson: null,
      message: result.error.message,
      status: "error"
    };
  }

  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath("/projects");

  return {
    canvasJson: result.project.canvasJson,
    message: "AI image generated.",
    status: "generated"
  };
}
