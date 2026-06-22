import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrandMemoryForm } from "../components/brand-memory-form";
import type { BrandMemory } from "../types/brand-memory";
import { initialBrandMemoryFormState } from "../types/brand-memory-form-state";

const memory: BrandMemory = {
  audience: "Homeowners with storm damage",
  accentColor: "#C49A3A",
  backgroundColor: "#FFFFFF",
  brandId: "brand_123",
  brandRules: "Stay practical and reassuring.",
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  id: "memory_123",
  notes: "Use local proof when possible.",
  preferredCtas: "Schedule an inspection",
  primaryColor: "#315B2C",
  productsServices: "Storm restoration",
  textColor: "#0B0F19",
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
  voice: "Professional and calm"
};

describe("BrandMemoryForm", () => {
  it("renders editable brand memory fields and the save action", () => {
    render(
      <BrandMemoryForm
        action={vi.fn()}
        brandName="ABC Roofing"
        initialState={initialBrandMemoryFormState}
        memory={memory}
      />
    );

    expect(screen.getByRole("heading", { name: "ABC Roofing memory" })).toBeInTheDocument();
    expect(screen.getByLabelText("Voice")).toHaveValue("Professional and calm");
    expect(screen.getByLabelText("Audience")).toHaveValue("Homeowners with storm damage");
    expect(screen.getByLabelText("Products and services")).toHaveValue("Storm restoration");
    expect(screen.getByLabelText("Brand rules")).toHaveValue("Stay practical and reassuring.");
    expect(screen.getByLabelText("Preferred CTAs")).toHaveValue("Schedule an inspection");
    expect(screen.getByLabelText("Notes")).toHaveValue("Use local proof when possible.");
    expect(screen.getByLabelText("Primary color")).toHaveValue("#315B2C");
    expect(screen.getByLabelText("Accent color")).toHaveValue("#C49A3A");
    expect(screen.getByLabelText("Background color")).toHaveValue("#FFFFFF");
    expect(screen.getByLabelText("Text color")).toHaveValue("#0B0F19");
    expect(screen.getByRole("button", { name: "Save Memory" })).toBeInTheDocument();
  });

  it("renders saved and validation states from the server action", () => {
    render(
      <BrandMemoryForm
        action={vi.fn()}
        brandName="ABC Roofing"
        initialState={{
          fieldErrors: {
            voice: ["Keep this under 2000 characters."]
          },
          message: "Brand memory saved.",
          status: "saved"
        }}
        memory={memory}
      />
    );

    expect(screen.getByText("Brand memory saved.")).toBeInTheDocument();
    expect(screen.getByText("Keep this under 2000 characters.")).toBeInTheDocument();
  });
});
