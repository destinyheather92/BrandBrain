import { createPrismaUserRepository } from "../repositories/prisma-user.repository";
import { syncClerkUserToLocalUser } from "./local-user-sync.service";
import type { LocalUserSyncResult } from "../types/user";

export async function syncCurrentClerkUserToLocalUser(clerkUser: unknown): Promise<LocalUserSyncResult> {
  if (!process.env.DATABASE_URL) {
    return {
      error: {
        code: "database_not_configured",
        message: "Add DATABASE_URL to enable local user sync."
      },
      ok: false,
      status: "skipped"
    };
  }

  return syncClerkUserToLocalUser({
    clerkUser,
    repository: createPrismaUserRepository()
  });
}
