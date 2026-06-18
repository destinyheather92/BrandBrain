"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPrismaBrandMemoryRepository } from "@/features/brands/repositories/prisma-brand-memory.repository";
import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import { createPrismaProjectThemeRepository } from "@/features/themes/repositories/prisma-project-theme.repository";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaGenerationCostRepository } from "../repositories/prisma-generation-cost.repository";
import { createDefaultAiProviderRegistry } from "../providers/local-canvas-generation.provider";
import { generateProjectDraftForUser } from "../services/ai-generation-pipeline.service";
import type { AiGenerationActionState } from "../types/ai-generation-action-state";

export async function generateProjectDraftAction(
  _previousState: AiGenerationActionState,
  formData: FormData
): Promise<AiGenerationActionState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const projectId = formData.get("projectId");
  const userRequest = formData.get("userRequest");

  if (typeof projectId !== "string" || typeof userRequest !== "string") {
    return {
      canvasJson: null,
      message: "AI draft could not be generated.",
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

  const result = await generateProjectDraftForUser({
    brandMemoryRepository: createPrismaBrandMemoryRepository(),
    brandRepository: createPrismaBrandRepository(),
    generationCostRepository: createPrismaGenerationCostRepository(),
    ownerUserId: syncResult.user.id,
    projectId,
    projectRepository: createPrismaContentProjectRepository(),
    providerRegistry: createDefaultAiProviderRegistry(),
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
    message: "AI draft generated.",
    status: "generated"
  };
}
