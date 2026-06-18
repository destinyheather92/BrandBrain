import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectEditorShell } from "../components/project-editor-shell";
import type { ContentProject } from "../types/content-project";
import { initialProjectEditorSaveState } from "../types/project-editor-form-state";

const project: ContentProject = {
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
};

describe("ProjectEditorShell", () => {
  it("renders a visual editor for a saved content project", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Storm Damage Carousel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Text" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Shape" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add CTA" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Project" })).toBeInTheDocument();
    expect(screen.getByLabelText("Slide 1 canvas")).toBeInTheDocument();
  });

  it("adds and edits a text element on the canvas", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));
    expect(screen.getByRole("button", { name: "Editable headline" })).toBeInTheDocument();

    const textInput = screen.getByLabelText("Text");
    fireEvent.change(textInput, {
      target: {
        value: "Roof inspection checklist"
      }
    });

    expect(screen.getByRole("button", { name: "Roof inspection checklist" })).toBeInTheDocument();
    expect(screen.getByLabelText("Text")).toHaveValue("Roof inspection checklist");
  });

  it("stores the edited canvas JSON in the save form", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add CTA" }));

    const canvasJsonInput = screen.getByTestId("project-editor-canvas-json");

    expect((canvasJsonInput as HTMLInputElement).value).toContain("\"type\":\"cta\"");
  });
});
