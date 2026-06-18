import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Brand } from "@/features/brands/types/brand";

import { ContentProjectsShell } from "../components/content-projects-shell";
import type { ContentProject } from "../types/content-project";
import { initialContentProjectFormState } from "../types/content-project-form-state";

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

const projects: ContentProject[] = [
  {
    brandId: "brand_123",
    brandName: "ABC Roofing",
    canvasJson: {
      documentId: "document_1",
      format: "instagram-carousel",
      height: 1080,
      schemaVersion: "1.0.0",
      slides: [
        {
          background: {
            color: "#0B0F19",
            type: "solid"
          },
          elements: [],
          height: 1080,
          id: "slide_1",
          name: "Slide 1",
          order: 1,
          width: 1080
        },
        {
          background: {
            color: "#0B0F19",
            type: "solid"
          },
          elements: [],
          height: 1080,
          id: "slide_2",
          name: "Slide 2",
          order: 2,
          width: 1080
        }
      ],
      themeId: null,
      title: "Storm Damage Carousel",
      unit: "px",
      width: 1080
    },
    createdAt: new Date("2026-06-18T12:00:00.000Z"),
    format: "instagram-carousel",
    id: "project_123",
    ownerUserId: "user_local_123",
    status: "draft",
    title: "Storm Damage Carousel",
    updatedAt: new Date("2026-06-18T12:00:00.000Z")
  }
];

describe("ContentProjectsShell", () => {
  it("renders project creation form and saved editable projects", () => {
    render(
      <ContentProjectsShell
        action={vi.fn()}
        brands={brands}
        initialState={initialContentProjectFormState}
        projects={projects}
      />
    );

    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByLabelText("Project title")).toBeInTheDocument();
    expect(screen.getByLabelText("Brand")).toHaveValue("brand_123");
    expect(screen.getByRole("button", { name: "Create Starter Project" })).toBeInTheDocument();
    expect(screen.getByText("Storm Damage Carousel")).toBeInTheDocument();
    expect(screen.getAllByText("ABC Roofing")).toHaveLength(2);
    expect(screen.getByText("2 editable slides")).toBeInTheDocument();
    expect(screen.getByText("Canvas JSON source")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Editor" })).toHaveAttribute(
      "href",
      "/projects/project_123/editor"
    );
  });

  it("guides users to create a brand before creating projects", () => {
    render(
      <ContentProjectsShell
        action={vi.fn()}
        brands={[]}
        initialState={initialContentProjectFormState}
        projects={[]}
      />
    );

    expect(screen.getByText("Create or import a brand before starting a project.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Brand" })).toHaveAttribute("href", "/brands/new");
  });
});
