"use server";

import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

import { createPrismaContentProjectRepository } from "../repositories/prisma-content-project.repository";
import { createPrismaProjectVersionRepository } from "../repositories/prisma-project-version.repository";
import {
  autosaveProjectCanvasForUser,
  saveProjectCanvasForUser
} from "../services/project-editor.service";
import type { ProjectEditorSaveState } from "../types/project-editor-form-state";

export async function saveProjectCanvasAction(
  _previousState: ProjectEditorSaveState,
  formData: FormData
): Promise<ProjectEditorSaveState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const projectId = formData.get("projectId");
  const canvasJson = formData.get("canvasJson");

  if (typeof projectId !== "string" || typeof canvasJson !== "string") {
    return {
      message: "Project changes could not be saved.",
      status: "error"
    };
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return {
      message: syncResult.error.message,
      status: "error"
    };
  }

  const result = await saveProjectCanvasForUser({
    canvasJson,
    ownerUserId: syncResult.user.id,
    projectId,
    projectRepository: createPrismaContentProjectRepository(),
    projectVersionRepository: createPrismaProjectVersionRepository()
  });

  if (!result.ok) {
    return {
      message: result.error.message,
      status: "error"
    };
  }

  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath("/projects");

  return {
    message: "Project saved.",
    status: "saved",
    version: result.version
  };
}

export async function autosaveProjectCanvasAction(
  _previousState: ProjectEditorSaveState,
  formData: FormData
): Promise<ProjectEditorSaveState> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const projectId = formData.get("projectId");
  const canvasJson = formData.get("canvasJson");

  if (typeof projectId !== "string" || typeof canvasJson !== "string") {
    return {
      message: "Autosave could not run.",
      status: "error"
    };
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return {
      message: syncResult.error.message,
      status: "error"
    };
  }

  const result = await autosaveProjectCanvasForUser({
    canvasJson,
    ownerUserId: syncResult.user.id,
    projectId,
    projectRepository: createPrismaContentProjectRepository(),
    projectVersionRepository: createPrismaProjectVersionRepository()
  });

  if (!result.ok) {
    return {
      message: result.error.message,
      status: "error"
    };
  }

  revalidatePath(`/projects/${projectId}/editor`);
  revalidatePath("/projects");

  return {
    message: "Autosaved.",
    status: "saved",
    version: result.version
  };
}
