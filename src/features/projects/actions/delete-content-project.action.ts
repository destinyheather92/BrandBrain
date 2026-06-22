"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaContentProjectRepository } from "../repositories/prisma-content-project.repository";
import { deleteContentProjectForUser } from "../services/content-project.service";

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function deleteContentProjectAction(formData: FormData): Promise<void> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    redirect("/projects?deleteError=sync");
  }

  const result = await deleteContentProjectForUser({
    ownerUserId: syncResult.user.id,
    projectId: getFormString(formData, "projectId"),
    projectRepository: createPrismaContentProjectRepository()
  });

  if (!result.ok) {
    redirect(`/projects?deleteError=${result.error.code}`);
  }

  revalidatePath("/projects");
  redirect("/projects?deleted=1");
}
