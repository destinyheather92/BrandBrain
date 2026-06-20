import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { createProjectFromTemplateAction } from "@/features/templates/actions/create-project-from-template.action";
import { TemplatesShell } from "@/features/templates/components/templates-shell";
import { listContentTemplates } from "@/features/templates/services/template-library.service";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";
import { initialContentProjectFormState } from "@/features/projects/types/content-project-form-state";

export default async function TemplatesPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);
  const templates = listContentTemplates();

  if (!syncResult.ok) {
    return (
      <TemplatesShell
        action={createProjectFromTemplateAction}
        brands={[]}
        initialState={initialContentProjectFormState}
        message={syncResult.error.message}
        templates={templates}
      />
    );
  }

  const brands = await createPrismaBrandRepository().listByOwnerUserId(syncResult.user.id);

  return (
    <TemplatesShell
      action={createProjectFromTemplateAction}
      brands={brands}
      initialState={initialContentProjectFormState}
      templates={templates}
    />
  );
}
