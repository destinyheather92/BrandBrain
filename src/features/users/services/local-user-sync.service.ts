import { clerkUserSyncPayloadSchema, localUserUpsertInputSchema } from "../schemas/local-user.schema";
import type {
  ClerkUserSyncPayload,
  LocalUserSyncResult,
  LocalUserUpsertInput,
  UserRepository
} from "../types/user";

type SyncClerkUserToLocalUserInput = {
  clerkUser: unknown;
  repository: UserRepository;
};

function normalizeName(clerkUser: ClerkUserSyncPayload): string | null {
  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ")
    .trim();

  return fullName || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || null;
}

export async function syncClerkUserToLocalUser({
  clerkUser,
  repository
}: SyncClerkUserToLocalUserInput): Promise<LocalUserSyncResult> {
  const parsed = clerkUserSyncPayloadSchema.safeParse(clerkUser);

  if (!parsed.success) {
    return {
      error: {
        code: "invalid_clerk_user",
        message: "Clerk user payload is missing required identity fields."
      },
      ok: false,
      status: "failed"
    };
  }

  const input: LocalUserUpsertInput = localUserUpsertInputSchema.parse({
    clerkUserId: parsed.data.id,
    email: parsed.data.emailAddresses[0]?.emailAddress ?? null,
    imageUrl: parsed.data.imageUrl ?? null,
    name: normalizeName(parsed.data)
  });

  try {
    const user = await repository.upsertFromClerk(input);

    return {
      ok: true,
      status: "synced",
      user
    };
  } catch {
    return {
      error: {
        code: "repository_error",
        message: "Local user sync failed."
      },
      ok: false,
      status: "failed"
    };
  }
}
