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

type NormalizedClerkIdentity = {
  firstName: string | null;
  lastName: string | null;
  name: string | null;
};

function normalizeString(value: string | null | undefined): string | null {
  const normalized = value?.trim();

  return normalized ? normalized : null;
}

function normalizeIdentity(clerkUser: ClerkUserSyncPayload): NormalizedClerkIdentity {
  const firstName =
    normalizeString(clerkUser.firstName) ??
    normalizeString(clerkUser.unsafeMetadata?.brandbrainProfile?.firstName);
  const lastName =
    normalizeString(clerkUser.lastName) ??
    normalizeString(clerkUser.unsafeMetadata?.brandbrainProfile?.lastName);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    firstName,
    lastName,
    name: fullName || clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || null
  };
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

  const identity = normalizeIdentity(parsed.data);
  const input: LocalUserUpsertInput = localUserUpsertInputSchema.parse({
    clerkUserId: parsed.data.id,
    email: parsed.data.emailAddresses[0]?.emailAddress ?? null,
    firstName: identity.firstName,
    imageUrl: parsed.data.imageUrl ?? null,
    lastName: identity.lastName,
    name: identity.name
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
