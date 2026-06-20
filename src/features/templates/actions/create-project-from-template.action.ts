"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import type { ContentProjectFormState } from "@/features/projects/types/content-project-form-state";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createProjectFromTemplateForUser } from "../services/template-library.service";
import type { TemplateProjectCreateInput } from "../types/template";

function getFormString(formData: FormData, key: keyof TemplateProjectCreateInput) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createProjectFromTemplateAction(
  _previousState: ContentProjectFormState,
  formData: FormData
): Promise<ContentProjectFormState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return {
      fieldErrors: {},
      message: syncResult.error.message,
      status: "error"
    };
  }

  const result = await createProjectFromTemplateForUser({
    brandRepository: createPrismaBrandRepository(),
    input: {
      brandId: getFormString(formData, "brandId"),
      templateId: getFormString(formData, "templateId"),
      title: getFormString(formData, "title")
    },
    ownerUserId: syncResult.user.id,
    projectRepository: createPrismaContentProjectRepository()
  });

  if (!result.ok) {
    return {
      fieldErrors: {
        brandId: result.error.fieldErrors?.brandId,
        title: result.error.fieldErrors?.title
      },
      message: result.error.message,
      status: "error"
    };
  }

  redirect(`/projects/${result.project.id}/editor?template=${getFormString(formData, "templateId")}`);
}
