import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { ContentProjectsShell } from "@/features/projects/components/content-projects-shell";
import { createContentProjectAction } from "@/features/projects/actions/create-content-project.action";
import { deleteContentProjectAction } from "@/features/projects/actions/delete-content-project.action";
import { createPrismaContentProjectRepository } from "@/features/projects/repositories/prisma-content-project.repository";
import { listContentProjectsForUser } from "@/features/projects/services/content-project.service";
import { initialContentProjectFormState } from "@/features/projects/types/content-project-form-state";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

type ProjectsPageProps = {
  searchParams: Promise<{
    created?: string;
    deleted?: string;
    deleteError?: string;
  }>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return (
      <ContentProjectsShell
        action={createContentProjectAction}
        brands={[]}
        deleteAction={deleteContentProjectAction}
        initialState={initialContentProjectFormState}
        message={syncResult.error.message}
        messageTone="error"
        projects={[]}
      />
    );
  }

  const params = await searchParams;
  const brandRepository = createPrismaBrandRepository();
  const [brands, projectsResult] = await Promise.all([
    brandRepository.listByOwnerUserId(syncResult.user.id),
    listContentProjectsForUser({
      ownerUserId: syncResult.user.id,
      projectRepository: createPrismaContentProjectRepository()
    })
  ]);
  const pageMessage = params.created
    ? "Project created successfully."
    : params.deleted
      ? "Project deleted successfully."
      : params.deleteError
        ? "Project could not be deleted."
        : projectsResult.ok
          ? undefined
          : projectsResult.error.message;
  const messageTone = params.deleteError || !projectsResult.ok ? "error" : "success";

  return (
    <ContentProjectsShell
      action={createContentProjectAction}
      brands={brands}
      deleteAction={deleteContentProjectAction}
      initialState={initialContentProjectFormState}
      message={pageMessage}
      messageTone={messageTone}
      projects={projectsResult.ok ? projectsResult.projects : []}
    />
  );
}
