import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { syncCurrentClerkUserToLocalUser } from "@/features/users/services/current-user-sync.service";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName = user.firstName ?? user.username ?? user.emailAddresses[0]?.emailAddress ?? "there";
  const email = user.emailAddresses[0]?.emailAddress;
  const syncResult = await syncCurrentClerkUserToLocalUser(user);
  const syncStatus = syncResult.ok
    ? "active"
    : syncResult.error.code === "database_not_configured"
      ? "needs-database"
      : "failed";

  return (
    <DashboardShell
      accountControl={<UserButton />}
      displayName={displayName}
      email={email}
      syncDetail={syncResult.ok ? "Synced from Clerk" : syncResult.error.message}
      syncStatus={syncStatus}
    />
  );
}
