import { describe, expect, it, vi } from "vitest";

import { createBrandForUser } from "../services/brand.service";
import type { Brand, BrandRepository } from "../types/brand";

const createdBrand: Brand = {
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  description: "A premium roofing company.",
  id: "brand_123",
  industry: "Roofing",
  name: "ABC Roofing",
  ownerUserId: "user_local_123",
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
  websiteUrl: "https://abcroofing.com"
};

function createRepository(): BrandRepository {
  return {
    create: vi.fn().mockResolvedValue(createdBrand),
    listByOwnerUserId: vi.fn()
  };
}

describe("createBrandForUser", () => {
  it("validates and creates a brand for the local user", async () => {
    const repository = createRepository();

    const result = await createBrandForUser({
      input: {
        description: "  A premium roofing company.  ",
        industry: "  Roofing ",
        name: "  ABC Roofing  ",
        websiteUrl: "https://abcroofing.com"
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(result).toEqual({ brand: createdBrand, ok: true, status: "created" });
    expect(repository.create).toHaveBeenCalledWith({
      description: "A premium roofing company.",
      industry: "Roofing",
      name: "ABC Roofing",
      ownerUserId: "user_local_123",
      websiteUrl: "https://abcroofing.com"
    });
  });

  it("converts empty optional strings to null before persistence", async () => {
    const repository = createRepository();

    await createBrandForUser({
      input: {
        description: "",
        industry: " ",
        name: "Summit Solar",
        websiteUrl: ""
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(repository.create).toHaveBeenCalledWith({
      description: null,
      industry: null,
      name: "Summit Solar",
      ownerUserId: "user_local_123",
      websiteUrl: null
    });
  });

  it("returns a typed validation failure for invalid input", async () => {
    const repository = createRepository();

    const result = await createBrandForUser({
      input: {
        description: "",
        industry: "",
        name: "",
        websiteUrl: "not-a-url"
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected brand creation to fail validation.");
    }

    expect(result.status).toBe("failed");
    expect(result.error.code).toBe("invalid_brand_input");
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("returns a typed repository failure without leaking raw database errors", async () => {
    const repository: BrandRepository = {
      create: vi.fn().mockRejectedValue(new Error("duplicate key value")),
      listByOwnerUserId: vi.fn()
    };

    const result = await createBrandForUser({
      input: {
        description: null,
        industry: null,
        name: "ABC Roofing",
        websiteUrl: null
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(result).toEqual({
      error: {
        code: "repository_error",
        message: "Brand creation failed."
      },
      ok: false,
      status: "failed"
    });
  });
});
