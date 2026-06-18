"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaBrandRepository } from "../repositories/prisma-brand.repository";
import { createBrandForUser } from "../services/brand.service";
import type { BrandCreateFormState } from "../types/brand-create-form-state";
import type { BrandCreateInput } from "../types/brand";

function getFormString(formData: FormData, key: keyof BrandCreateInput) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function createBrandAction(
  _previousState: BrandCreateFormState,
  formData: FormData
): Promise<BrandCreateFormState> {
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

  const result = await createBrandForUser({
    input: {
      description: getFormString(formData, "description"),
      industry: getFormString(formData, "industry"),
      name: getFormString(formData, "name"),
      websiteUrl: getFormString(formData, "websiteUrl")
    },
    ownerUserId: syncResult.user.id,
    repository: createPrismaBrandRepository()
  });

  if (!result.ok) {
    return {
      fieldErrors: result.error.fieldErrors ?? {},
      message: result.error.message,
      status: "error"
    };
  }

  redirect(`/brands?created=${result.brand.id}`);
}
