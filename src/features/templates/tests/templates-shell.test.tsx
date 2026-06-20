import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Brand } from "@/features/brands/types/brand";
import { initialContentProjectFormState } from "@/features/projects/types/content-project-form-state";

import { TemplatesShell } from "../components/templates-shell";
import { listContentTemplates } from "../services/template-library.service";

const brands: Brand[] = [
  {
    createdAt: new Date("2026-06-18T12:00:00.000Z"),
    description: "Storm restoration, inspections, and roof replacements.",
    id: "brand_123",
    industry: "Roofing",
    name: "ABC Roofing",
    ownerUserId: "user_local_123",
    updatedAt: new Date("2026-06-18T12:00:00.000Z"),
    websiteUrl: "https://abcroofing.com/"
  }
];

describe("TemplatesShell", () => {
  it("renders template previews with brand-aware create forms", () => {
    render(
      <TemplatesShell
        action={vi.fn()}
        brands={brands}
        initialState={initialContentProjectFormState}
        templates={listContentTemplates()}
      />
    );

    expect(screen.getByRole("heading", { name: "Templates" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Myth Buster Carousel" })).toBeInTheDocument();
    expect(screen.getByLabelText("Brand for Myth Buster Carousel")).toHaveValue("brand_123");
    expect(screen.getByLabelText("Project title for Myth Buster Carousel")).toHaveValue("Myth Buster Carousel");
    expect(screen.getByRole("button", { name: "Use Myth Buster Carousel" })).toBeInTheDocument();
    expect(screen.getAllByLabelText(/template preview$/i).length).toBeGreaterThanOrEqual(2);
  });

  it("asks users to create a brand before using templates", () => {
    render(
      <TemplatesShell
        action={vi.fn()}
        brands={[]}
        initialState={initialContentProjectFormState}
        templates={listContentTemplates()}
      />
    );

    expect(screen.getAllByText("Create a brand before using templates.").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Create Brand" }).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Use/ })).not.toBeInTheDocument();
  });
});
