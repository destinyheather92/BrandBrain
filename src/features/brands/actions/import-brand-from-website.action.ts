"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaBrandRepository } from "../repositories/prisma-brand.repository";
import { fetchWebsiteHtml } from "../services/website-fetch.service";
import { importBrandFromWebsite } from "../services/website-import.service";
import type { WebsiteImportFormState } from "../types/website-import-form-state";
import type { WebsiteImportInput } from "../types/website-import";

function getFormString(formData: FormData, key: keyof WebsiteImportInput) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function importBrandFromWebsiteAction(
  _previousState: WebsiteImportFormState,
  formData: FormData
): Promise<WebsiteImportFormState> {
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

  const result = await importBrandFromWebsite({
    fetcher: fetchWebsiteHtml,
    input: {
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

  redirect(`/brands?imported=${result.brand.id}`);
}
