import type { z } from "zod";

import type {
  clerkUserSyncPayloadSchema,
  localUserSchema,
  localUserUpsertInputSchema
} from "../schemas/local-user.schema";

export type ClerkUserSyncPayload = z.infer<typeof clerkUserSyncPayloadSchema>;
export type LocalUser = z.infer<typeof localUserSchema>;
export type LocalUserUpsertInput = z.infer<typeof localUserUpsertInputSchema>;

export type LocalUserSyncErrorCode =
  | "database_not_configured"
  | "invalid_clerk_user"
  | "repository_error";

export type LocalUserSyncResult =
  | {
      ok: true;
      status: "synced";
      user: LocalUser;
    }
  | {
      error: {
        code: LocalUserSyncErrorCode;
        message: string;
      };
      ok: false;
      status: "failed" | "skipped";
    };

export type UserRepository = {
  upsertFromClerk(input: LocalUserUpsertInput): Promise<LocalUser>;
};
