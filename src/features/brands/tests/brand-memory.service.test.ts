import { describe, expect, it, vi } from "vitest";

import {
  getOrCreateBrandMemoryForBrand,
  updateBrandMemoryForBrand
} from "../services/brand-memory.service";
import type { Brand } from "../types/brand";
import type { BrandMemory, BrandMemoryRepository } from "../types/brand-memory";

const brand: Brand = {
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  description: "Storm restoration, inspections, and roof replacements.",
  id: "brand_123",
  industry: "Roofing",
  name: "ABC Roofing",
  ownerUserId: "user_local_123",
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
  websiteUrl: "https://abcroofing.com/"
};

const memory: BrandMemory = {
  audience: "Homeowners with storm damage",
  brandId: "brand_123",
  brandRules: "Stay practical and reassuring.",
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  id: "memory_123",
  notes: "Use local proof when possible.",
  preferredCtas: "Schedule an inspection",
  productsServices: "Storm restoration, inspections, and roof replacements.",
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
  voice: "Professional and calm"
};

function createRepository(overrides: Partial<BrandMemoryRepository> = {}): BrandMemoryRepository {
  return {
    create: vi.fn().mockResolvedValue(memory),
    getByBrandId: vi.fn().mockResolvedValue(null),
    update: vi.fn().mockResolvedValue(memory),
    ...overrides
  };
}

describe("getOrCreateBrandMemoryForBrand", () => {
  it("creates initial memory from the brand when none exists", async () => {
    const repository = createRepository();

    const result = await getOrCreateBrandMemoryForBrand({
      brand,
      repository
    });

    expect(result).toEqual({
      memory,
      ok: true,
      status: "ready"
    });
    expect(repository.create).toHaveBeenCalledWith({
      audience: null,
      brandId: "brand_123",
      brandRules: "Stay relevant to Roofing.",
      notes: "Website: https://abcroofing.com/",
      preferredCtas: null,
      productsServices: "Storm restoration, inspections, and roof replacements.",
      voice: null
    });
  });

  it("preserves existing user-edited memory instead of reinitializing it", async () => {
    const repository = createRepository({
      getByBrandId: vi.fn().mockResolvedValue(memory)
    });

    const result = await getOrCreateBrandMemoryForBrand({
      brand,
      repository
    });

    expect(result).toEqual({
      memory,
      ok: true,
      status: "ready"
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("returns memory when a duplicate first-load create already inserted it", async () => {
    const repository = createRepository({
      create: vi.fn().mockRejectedValue({ code: "P2002" }),
      getByBrandId: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(memory)
    });

    const result = await getOrCreateBrandMemoryForBrand({
      brand,
      repository
    });

    expect(result).toEqual({
      memory,
      ok: true,
      status: "ready"
    });
    expect(repository.getByBrandId).toHaveBeenCalledTimes(2);
  });

  it("returns a restart hint when the generated Prisma client is stale", async () => {
    const repository = createRepository({
      getByBrandId: vi
        .fn()
        .mockRejectedValue(new TypeError("Cannot read properties of undefined (reading 'findUnique')"))
    });

    const result = await getOrCreateBrandMemoryForBrand({
      brand,
      repository
    });

    expect(result).toEqual({
      error: {
        code: "brand_memory_repository_unavailable",
        message: "Brand memory storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    });
  });
});

describe("updateBrandMemoryForBrand", () => {
  it("validates, normalizes, and saves user-edited memory", async () => {
    const repository = createRepository();

    const result = await updateBrandMemoryForBrand({
      input: {
        audience: "  Homeowners with storm damage  ",
        brandRules: "  Stay practical and reassuring. ",
        notes: "",
        preferredCtas: "  Schedule an inspection ",
        productsServices: " Storm restoration ",
        voice: " Professional and calm "
      },
      brandId: "brand_123",
      repository
    });

    expect(result).toEqual({
      memory,
      ok: true,
      status: "saved"
    });
    expect(repository.update).toHaveBeenCalledWith("brand_123", {
      audience: "Homeowners with storm damage",
      brandRules: "Stay practical and reassuring.",
      notes: null,
      preferredCtas: "Schedule an inspection",
      productsServices: "Storm restoration",
      voice: "Professional and calm"
    });
  });

  it("returns typed validation errors for overlong memory fields", async () => {
    const repository = createRepository();

    const result = await updateBrandMemoryForBrand({
      input: {
        audience: "x".repeat(2001),
        brandRules: "",
        notes: "",
        preferredCtas: "",
        productsServices: "",
        voice: ""
      },
      brandId: "brand_123",
      repository
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      error: {
        code: "invalid_brand_memory_input",
        fieldErrors: {
          audience: ["Keep this under 2000 characters."]
        }
      },
      status: "failed"
    });
    expect(repository.update).not.toHaveBeenCalled();
  });
});
