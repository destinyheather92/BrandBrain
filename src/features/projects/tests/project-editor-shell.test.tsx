import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectEditorShell } from "../components/project-editor-shell";
import type { ContentProject } from "../types/content-project";
import { initialProjectEditorSaveState } from "../types/project-editor-form-state";
import type { ProjectVersion } from "../types/project-version";

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

const version: ProjectVersion = {
  canvasJson: project.canvasJson,
  createdAt: new Date("2026-06-18T12:05:00.000Z"),
  id: "version_1",
  ownerUserId: "user_local_123",
  projectId: "project_123",
  source: "manual-save",
  versionNumber: 1
};

const restoredCanvasJson = {
  ...project.canvasJson,
  slides: [
    {
      ...project.canvasJson.slides[0],
      elements: [
        {
          color: "#F8FAFC",
          content: "Restored version headline",
          fontFamily: "Geist",
          fontSize: 72,
          fontWeight: "bold" as const,
          height: 180,
          id: "headline_restored",
          letterSpacing: 0,
          lineHeight: 1.1,
          locked: false,
          opacity: 1,
          rotation: 0,
          textAlign: "left" as const,
          type: "text" as const,
          width: 720,
          x: 96,
          y: 180,
          zIndex: 1
        }
      ]
    }
  ]
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
    expect(screen.getByRole("heading", { name: "Export" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export PNG" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export JPG" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
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

  it("moves a canvas object by dragging it directly on the canvas", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));

    const textLayer = screen.getByRole("button", { name: "Editable headline" });

    fireEvent.pointerDown(textLayer, {
      clientX: 100,
      clientY: 100,
      pointerId: 1
    });
    fireEvent.pointerMove(textLayer, {
      clientX: 128,
      clientY: 156,
      pointerId: 1
    });
    fireEvent.pointerUp(textLayer, {
      pointerId: 1
    });

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);
    const textElement = canvasJson.slides[0].elements.find((element: { type: string }) => element.type === "text");

    expect(textElement).toMatchObject({
      x: 150,
      y: 288
    });
  });

  it("resizes a selected canvas object with a resize handle", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));

    const resizeHandle = screen.getByRole("button", { name: "Resize Editable headline" });

    fireEvent.pointerDown(resizeHandle, {
      clientX: 100,
      clientY: 100,
      pointerId: 1
    });
    fireEvent.pointerMove(resizeHandle, {
      clientX: 128,
      clientY: 156,
      pointerId: 1
    });
    fireEvent.pointerUp(resizeHandle, {
      pointerId: 1
    });

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);
    const textElement = canvasJson.slides[0].elements.find((element: { type: string }) => element.type === "text");

    expect(textElement).toMatchObject({
      height: 288,
      width: 774
    });
  });

  it("renders CTA layers without a browser border or focus outline", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add CTA" }));

    const ctaLayer = screen.getByRole("button", { name: "Book an inspection" });

    expect(ctaLayer).toHaveClass("border-0");
    expect(ctaLayer).toHaveClass("overflow-hidden");
    expect(ctaLayer).toHaveClass("break-words");
    expect(ctaLayer).toHaveClass("outline-none");
    expect(ctaLayer).toHaveClass("focus-visible:outline-none");
    expect(ctaLayer).toHaveStyle({
      borderStyle: "none",
      borderWidth: "0px"
    });
  });

  it("allows a CTA label to be cleared before typing replacement copy", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add CTA" }));

    const labelInput = screen.getByLabelText("Label");

    fireEvent.change(labelInput, {
      target: {
        value: ""
      }
    });

    expect(labelInput).toHaveValue("");
  });

  it("autosaves canvas edits and shows recent versions", async () => {
    const autosavedVersion: ProjectVersion = {
      ...version,
      id: "version_2",
      source: "autosave",
      versionNumber: 2
    };
    const autosaveAction = vi.fn().mockResolvedValue({
      message: "Autosaved.",
      status: "saved",
      version: autosavedVersion
    });

    render(
      <ProjectEditorShell
        autosaveAction={autosaveAction}
        autosaveDelayMs={0}
        initialState={initialProjectEditorSaveState}
        initialVersions={[version]}
        project={project}
        saveAction={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Version History" })).toBeInTheDocument();
    expect(screen.getByText("Manual save")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));

    await waitFor(() => expect(autosaveAction).toHaveBeenCalled());

    const autosaveFormData = autosaveAction.mock.calls[0]?.[1] as FormData;

    expect(autosaveFormData.get("projectId")).toBe("project_123");
    expect(autosaveFormData.get("canvasJson")).toContain("Editable headline");
    expect(await screen.findByText("Autosaved.")).toBeInTheDocument();
    expect(screen.getByText("Autosave")).toBeInTheDocument();
    expect(screen.getByText("Version 2")).toBeInTheDocument();
  });

  it("restores a version into the visible editor canvas", async () => {
    const restoredVersion: ProjectVersion = {
      ...version,
      canvasJson: restoredCanvasJson,
      id: "version_2",
      source: "version-restore",
      versionNumber: 2
    };
    const restoreVersionAction = vi.fn().mockResolvedValue({
      canvasJson: restoredCanvasJson,
      message: "Version 1 restored.",
      restoredVersionId: "version_1",
      status: "saved",
      version: restoredVersion
    });

    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        initialVersions={[version]}
        project={project}
        restoreVersionAction={restoreVersionAction}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Restore Version 1" }));

    await waitFor(() => expect(restoreVersionAction).toHaveBeenCalled());
    expect(await screen.findByRole("button", { name: "Restored version headline" })).toBeInTheDocument();
    expect(screen.getByText("Version 1 restored.")).toBeInTheDocument();
    expect(screen.getByText("Version restore")).toBeInTheDocument();
  });
});
