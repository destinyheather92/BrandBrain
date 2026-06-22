import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { generateCreativeBriefAction } from "@/features/ai/actions/generate-creative-brief.action";
import { generateProjectDraftAction } from "@/features/ai/actions/generate-project-draft.action";
import { generateProjectImageAction } from "@/features/ai/actions/generate-project-image.action";
import { initialAiGenerationActionState } from "@/features/ai/types/ai-generation-action-state";
import { initialAiImageGenerationActionState } from "@/features/ai/types/ai-image-generation-action-state";
import { initialCreativeBriefActionState } from "@/features/ai/types/creative-brief-action-state";
import {
  autosaveProjectCanvasAction,
  restoreProjectVersionAction,
  saveProjectCanvasAction
} from "@/features/projects/actions/save-project-canvas.action";
import { ProjectEditorShell } from "@/features/projects/components/project-editor-shell";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import { createPrismaProjectVersionRepository } from "@/features/projects/repositories/prisma-project-version.repository";
import {
  getContentProjectForEditor,
  listProjectVersionsForUser
} from "@/features/projects/services/project-editor.service";
import { initialProjectEditorSaveState } from "@/features/projects/types/project-editor-form-state";
import { generateProjectThemeAction } from "@/features/themes/actions/generate-project-theme.action";
import { createPrismaProjectThemeRepository } from "@/features/themes/repositories/prisma-project-theme.repository";
import { getProjectThemeForUser } from "@/features/themes/services/theme-engine.service";
import { initialProjectThemeActionState } from "@/features/themes/types/project-theme-action-state";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

type ProjectEditorPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectEditorPage({ params }: ProjectEditorPageProps) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return (
      <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
        <div className="mx-auto max-w-4xl rounded-lg border border-[#EF4444] bg-[#141A26] p-6">
          {syncResult.error.message}
        </div>
      </main>
    );
  }

  const { projectId } = await params;
  const editorResult = await getContentProjectForEditor({
    ownerUserId: syncResult.user.id,
    projectId,
    projectRepository: createPrismaContentProjectRepository()
  });

  if (!editorResult.ok) {
    redirect("/projects");
  }

  const themeResult = await getProjectThemeForUser({
    ownerUserId: syncResult.user.id,
    projectId,
    themeRepository: createPrismaProjectThemeRepository()
  });
  const versionResult = await listProjectVersionsForUser({
    ownerUserId: syncResult.user.id,
    projectId,
    projectVersionRepository: createPrismaProjectVersionRepository()
  });

  return (
    <ProjectEditorShell
      accountControl={<UserButton />}
      aiGenerationAction={generateProjectDraftAction}
      autosaveAction={autosaveProjectCanvasAction}
      creativeBriefAction={generateCreativeBriefAction}
      imageGenerationAction={generateProjectImageAction}
      initialAiGenerationState={initialAiGenerationActionState}
      initialAiImageGenerationState={initialAiImageGenerationActionState}
      initialCreativeBriefState={initialCreativeBriefActionState}
      initialState={initialProjectEditorSaveState}
      initialTheme={themeResult.ok ? themeResult.theme : null}
      initialThemeState={initialProjectThemeActionState}
      initialVersions={versionResult.ok ? versionResult.versions : []}
      project={editorResult.project}
      restoreVersionAction={restoreProjectVersionAction}
      saveAction={saveProjectCanvasAction}
      themeAction={generateProjectThemeAction}
    />
  );
}
