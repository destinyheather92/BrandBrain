import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { saveProjectCanvasAction } from "@/features/projects/actions/save-project-canvas.action";
import { ProjectEditorShell } from "@/features/projects/components/project-editor-shell";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import { getContentProjectForEditor } from "@/features/projects/services/project-editor.service";
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

  return (
    <ProjectEditorShell
      accountControl={<UserButton />}
      initialState={initialProjectEditorSaveState}
      initialTheme={themeResult.ok ? themeResult.theme : null}
      initialThemeState={initialProjectThemeActionState}
      project={editorResult.project}
      saveAction={saveProjectCanvasAction}
      themeAction={generateProjectThemeAction}
    />
  );
}
