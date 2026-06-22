import { describe, expect, it, vi } from "vitest";

import { syncClerkUserToLocalUser } from "../services/local-user-sync.service";
import type { LocalUser, UserRepository } from "../types/user";

const syncedUser: LocalUser = {
  clerkUserId: "user_123",
  createdAt: new Date("2026-06-17T20:00:00.000Z"),
  email: "john@example.com",
  firstName: "John",
  id: "local_123",
  imageUrl: "https://img.clerk.com/avatar.png",
  lastName: "Smith",
  name: "John Smith",
  updatedAt: new Date("2026-06-17T20:00:00.000Z")
};

function createRepository(): UserRepository {
  return {
    upsertFromClerk: vi.fn().mockResolvedValue(syncedUser)
  };
}

describe("syncClerkUserToLocalUser", () => {
  it("validates and upserts a Clerk user as a local BrandBrain user", async () => {
    const repository = createRepository();

    const result = await syncClerkUserToLocalUser({
      clerkUser: {
        emailAddresses: [{ emailAddress: "john@example.com" }],
        firstName: "John",
        id: "user_123",
        imageUrl: "https://img.clerk.com/avatar.png",
        lastName: "Smith",
        username: "johnsmith"
      },
      repository
    });

    expect(result).toEqual({ ok: true, status: "synced", user: syncedUser });
    expect(repository.upsertFromClerk).toHaveBeenCalledWith({
      clerkUserId: "user_123",
      email: "john@example.com",
      firstName: "John",
      imageUrl: "https://img.clerk.com/avatar.png",
      lastName: "Smith",
      name: "John Smith"
    });
  });

  it("falls back to username when a full name is unavailable", async () => {
    const repository = createRepository();

    await syncClerkUserToLocalUser({
      clerkUser: {
        emailAddresses: [{ emailAddress: "avery@example.com" }],
        firstName: null,
        id: "user_456",
        imageUrl: null,
        lastName: null,
        username: "averycreates"
      },
      repository
    });

    expect(repository.upsertFromClerk).toHaveBeenCalledWith({
      clerkUserId: "user_456",
      email: "avery@example.com",
      firstName: null,
      imageUrl: null,
      lastName: null,
      name: "averycreates"
    });
  });

  it("uses BrandBrain sign-up metadata when Clerk profile names are unavailable", async () => {
    const repository = createRepository();

    await syncClerkUserToLocalUser({
      clerkUser: {
        emailAddresses: [{ emailAddress: "avery@example.com" }],
        firstName: null,
        id: "user_789",
        imageUrl: null,
        lastName: null,
        unsafeMetadata: {
          brandbrainProfile: {
            firstName: "Avery",
            lastName: "Stone"
          }
        },
        username: null
      },
      repository
    });

    expect(repository.upsertFromClerk).toHaveBeenCalledWith({
      clerkUserId: "user_789",
      email: "avery@example.com",
      firstName: "Avery",
      imageUrl: null,
      lastName: "Stone",
      name: "Avery Stone"
    });
  });

  it("returns a typed validation failure for malformed Clerk input", async () => {
    const repository = createRepository();

    const result = await syncClerkUserToLocalUser({
      clerkUser: {
        emailAddresses: [],
        firstName: "No",
        id: "",
        imageUrl: null,
        lastName: "Id",
        username: null
      },
      repository
    });

    expect(result).toEqual({
      error: {
        code: "invalid_clerk_user",
        message: "Clerk user payload is missing required identity fields."
      },
      ok: false,
      status: "failed"
    });
    expect(repository.upsertFromClerk).not.toHaveBeenCalled();
  });

  it("returns a typed repository failure without throwing raw errors", async () => {
    const repository: UserRepository = {
      upsertFromClerk: vi.fn().mockRejectedValue(new Error("database unavailable"))
    };

    const result = await syncClerkUserToLocalUser({
      clerkUser: {
        emailAddresses: [{ emailAddress: "john@example.com" }],
        firstName: "John",
        id: "user_123",
        imageUrl: null,
        lastName: "Smith",
        username: null
      },
      repository
    });

    expect(result).toEqual({
      error: {
        code: "repository_error",
        message: "Local user sync failed."
      },
      ok: false,
      status: "failed"
    });
  });
});
