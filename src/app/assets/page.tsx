import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AssetsShell } from "@/features/assets/components/assets-shell";
import { createPrismaAssetRepository } from "@/features/assets/repositories/prisma-asset.repository";
import { listAssetsForUser } from "@/features/assets/services/asset-library.service";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

export default async function AssetsPage() {
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

  const result = await listAssetsForUser({
    assetRepository: createPrismaAssetRepository(),
    ownerUserId: syncResult.user.id
  });

  return result.ok ? (
    <AssetsShell accountControl={<UserButton />} assets={result.assets} />
  ) : (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
      <div className="mx-auto max-w-4xl rounded-lg border border-[#EF4444] bg-[#141A26] p-6">
        {result.error.message}
      </div>
    </main>
  );
}
