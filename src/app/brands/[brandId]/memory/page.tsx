import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import { saveBrandMemoryAction } from "@/features/brands/actions/save-brand-memory.action";
import { BrandMemoryForm } from "@/features/brands/components/brand-memory-form";
import { createPrismaBrandMemoryRepository } from "@/features/brands/repositories/prisma-brand-memory.repository";
import { createPrismaBrandRepository } from "@/features/brands/repositories/prisma-brand.repository";
import { getOrCreateBrandMemoryForBrand } from "@/features/brands/services/brand-memory.service";
import { initialBrandMemoryFormState } from "@/features/brands/types/brand-memory-form-state";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

type BrandMemoryPageProps = {
  params: Promise<{
    brandId: string;
  }>;
};

export default async function BrandMemoryPage({ params }: BrandMemoryPageProps) {
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

  const { brandId } = await params;
  const brand = await createPrismaBrandRepository().findByIdForOwner(brandId, syncResult.user.id);

  if (!brand) {
    redirect("/brands");
  }

  const memoryResult = await getOrCreateBrandMemoryForBrand({
    brand,
    repository: createPrismaBrandMemoryRepository()
  });

  if (!memoryResult.ok) {
    return (
      <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
        <div className="mx-auto max-w-4xl rounded-lg border border-[#EF4444] bg-[#141A26] p-6">
          {memoryResult.error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Link className="text-sm font-medium text-[#CBD5E1] hover:text-[#F8FAFC]" href="/brands">
              Back to brands
            </Link>
            <Link className="text-sm font-medium text-[#CBD5E1] hover:text-[#F8FAFC]" href="/dashboard">
              Dashboard
            </Link>
          </div>
          <UserButton />
        </header>
        <BrandMemoryForm
          action={saveBrandMemoryAction}
          brandName={brand.name}
          initialState={initialBrandMemoryFormState}
          memory={memoryResult.memory}
        />
      </div>
    </main>
  );
}
