import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const displayName = user.firstName ?? user.username ?? user.emailAddresses[0]?.emailAddress ?? "there";
  const email = user.emailAddresses[0]?.emailAddress;

  return (
    <DashboardShell
      accountControl={<UserButton />}
      displayName={displayName}
      email={email}
    />
  );
}
