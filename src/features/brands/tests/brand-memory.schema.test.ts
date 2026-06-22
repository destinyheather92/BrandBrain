import { describe, expect, it } from "vitest";

import { brandMemorySchema } from "../schemas/brand-memory.schema";

describe("brandMemorySchema", () => {
  it("normalizes missing legacy palette fields to null", () => {
    const createdAt = new Date("2026-06-18T12:00:00.000Z");

    const memory = brandMemorySchema.parse({
      audience: "Counseling clients",
      brandId: "brand_123",
      brandRules: "Stay grounded and supportive.",
      createdAt,
      id: "memory_123",
      notes: "Legacy row created before palette fields.",
      preferredCtas: "Book a consultation",
      productsServices: "Counseling services",
      updatedAt: createdAt,
      voice: "Calm and reassuring"
    });

    expect(memory).toMatchObject({
      accentColor: null,
      backgroundColor: null,
      primaryColor: null,
      textColor: null
    });
  });
});
