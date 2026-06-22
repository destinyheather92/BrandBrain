"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaContentProjectRepository } from "../repositories/prisma-content-project.repository";
import { createContentProjectForUser } from "../services/content-project.service";
import type { ContentProjectCreateFormInput } from "../types/content-project";
import type { ContentProjectFormState } from "../types/content-project-form-state";

const contentProjectFormats = ["instagram-carousel", "square-post", "story", "presentation"] as const;

function getFormString(formData: FormData, key: keyof ContentProjectCreateFormInput) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getFormFormat(formData: FormData): ContentProjectCreateFormInput["format"] {
  const value = formData.get("format");

  return typeof value === "string" && contentProjectFormats.includes(value as (typeof contentProjectFormats)[number])
    ? (value as ContentProjectCreateFormInput["format"])
    : undefined;
}

export async function createContentProjectAction(
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

  const result = await createContentProjectForUser({
    brandRepository: createPrismaBrandRepository(),
    input: {
      brandId: getFormString(formData, "brandId"),
      format: getFormFormat(formData),
      slideCount: getFormString(formData, "slideCount"),
      title: getFormString(formData, "title")
    },
    ownerUserId: syncResult.user.id,
    projectRepository: createPrismaContentProjectRepository()
  });

  if (!result.ok) {
    return {
      fieldErrors: result.error.fieldErrors ?? {},
      message: result.error.message,
      status: "error"
    };
  }

  redirect(`/projects?created=${result.project.id}`);
}
