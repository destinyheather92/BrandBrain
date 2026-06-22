"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPrismaBrandMemoryRepository } from "@/features/brands/repositories/prisma-brand-memory.repository";
import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { fetchWebsiteHtml } from "@/features/brands/services/website-fetch.service";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaProjectThemeRepository } from "../repositories/prisma-project-theme.repository";
import { generateProjectThemeForUser } from "../services/theme-engine.service";
import type { ProjectThemeActionState } from "../types/project-theme-action-state";

export async function generateProjectThemeAction(
  _previousState: ProjectThemeActionState,
  formData: FormData
): Promise<ProjectThemeActionState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const projectId = formData.get("projectId");

  if (typeof projectId !== "string" || projectId.trim().length === 0) {
    return {
      message: "Theme could not be generated.",
      status: "error",
      theme: null
    };
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return {
      message: syncResult.error.message,
      status: "error",
      theme: null
    };
  }

  const result = await generateProjectThemeForUser({
    brandMemoryRepository: createPrismaBrandMemoryRepository(),
    brandRepository: createPrismaBrandRepository(),
    ownerUserId: syncResult.user.id,
    projectId,
    projectRepository: createPrismaContentProjectRepository(),
    themeRepository: createPrismaProjectThemeRepository(),
    websiteFetcher: fetchWebsiteHtml
  });

  if (!result.ok) {
    return {
      message: result.error.message,
      status: "error",
      theme: null
    };
  }

  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath("/projects");

  return {
    message: "Theme generated.",
    status: "generated",
    theme: result.theme
  };
}
