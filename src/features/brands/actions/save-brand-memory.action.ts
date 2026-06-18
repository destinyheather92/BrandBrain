"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaBrandMemoryRepository } from "../repositories/prisma-brand-memory.repository";
import { createPrismaBrandRepository } from "../repositories/prisma-brand.repository";
import { updateBrandMemoryForBrand } from "../services/brand-memory.service";
import type { BrandMemoryUpdateFormInput } from "../types/brand-memory";
import type { BrandMemoryFormState } from "../types/brand-memory-form-state";

function getFormString(formData: FormData, key: keyof BrandMemoryUpdateFormInput | "brandId") {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function saveBrandMemoryAction(
  _previousState: BrandMemoryFormState,
  formData: FormData
): Promise<BrandMemoryFormState> {
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

  const brandId = getFormString(formData, "brandId");
  const brand = await createPrismaBrandRepository().findByIdForOwner(brandId, syncResult.user.id);

  if (!brand) {
    return {
      fieldErrors: {},
      message: "Brand memory was not found.",
      status: "error"
    };
  }

  const result = await updateBrandMemoryForBrand({
    brandId: brand.id,
    input: {
      audience: getFormString(formData, "audience"),
      brandRules: getFormString(formData, "brandRules"),
      notes: getFormString(formData, "notes"),
      preferredCtas: getFormString(formData, "preferredCtas"),
      productsServices: getFormString(formData, "productsServices"),
      voice: getFormString(formData, "voice")
    },
    repository: createPrismaBrandMemoryRepository()
  });

  if (!result.ok) {
    return {
      fieldErrors: result.error.fieldErrors ?? {},
      message: result.error.message,
      status: "error"
    };
  }

  return {
    fieldErrors: {},
    message: "Brand memory saved.",
    status: "saved"
  };
}
