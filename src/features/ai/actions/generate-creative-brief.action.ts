"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createPrismaBrandMemoryRepository } from "@/features/brands/repositories/prisma-brand-memory.repository";
import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { generateCreativeBriefForUser } from "../services/creative-brief.service";
import type { CreativeBriefActionState } from "../types/creative-brief-action-state";

export async function generateCreativeBriefAction(
  _previousState: CreativeBriefActionState,
  formData: FormData
): Promise<CreativeBriefActionState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const projectId = formData.get("projectId");
  const userRequest = formData.get("userRequest");

  if (typeof projectId !== "string" || typeof userRequest !== "string") {
    return {
      brief: null,
      message: "Creative brief could not be generated.",
      status: "error"
    };
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return {
      brief: null,
      message: syncResult.error.message,
      status: "error"
    };
  }

  const result = await generateCreativeBriefForUser({
    brandMemoryRepository: createPrismaBrandMemoryRepository(),
    brandRepository: createPrismaBrandRepository(),
    ownerUserId: syncResult.user.id,
    projectId,
    projectRepository: createPrismaContentProjectRepository(),
    userRequest
  });

  if (!result.ok) {
    return {
      brief: null,
      message: result.error.message,
      status: "error"
    };
  }

  return {
    brief: result.brief,
    message: "Creative brief ready.",
    status: "generated"
  };
}
