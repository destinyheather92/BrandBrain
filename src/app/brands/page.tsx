import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { BrandsListShell } from "@/features/brands/components/brands-list-shell";
import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

type BrandsPageProps = {
  searchParams: Promise<{
    created?: string;
  }>;
};

export default async function BrandsPage({ searchParams }: BrandsPageProps) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const syncResult = await syncCurrentClerkUserToLocalUser(clerkUser);

  if (!syncResult.ok) {
    return (
      <BrandsListShell
        brands={[]}
        message={syncResult.error.message}
      />
    );
  }

  const params = await searchParams;
  const brands = await createPrismaBrandRepository().listByOwnerUserId(syncResult.user.id);

  return (
    <BrandsListShell
      brands={brands}
      message={params.created ? "Brand created successfully." : undefined}
    />
  );
}
