import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProjectEditorShell } from "../components/project-editor-shell";
import type { ContentProject } from "../types/content-project";
import { initialProjectEditorSaveState } from "../types/project-editor-form-state";
import type { ProjectVersion } from "../types/project-version";
import type { ProjectTheme } from "@/features/themes/types/project-theme";

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

const theme: ProjectTheme = {
  brandId: "brand_123",
  createdAt: new Date("2026-06-18T12:03:00.000Z"),
  id: "theme_123",
  imageStyle: "Crisp professional roofing photography.",
  layout: {
    density: "editorial",
    heroTreatment: "large-headline-left",
    spacingScale: "comfortable"
  },
  name: "ABC Roofing Theme",
  ownerUserId: "user_local_123",
  palette: {
    accent: "#00E5FF",
    background: "#FFFFFF",
    ctaText: "#0B0F19",
    primary: "#0B0F19",
    secondary: "#CBD5E1",
    surface: "#F8FAFC",
    text: "#0B0F19"
  },
  projectId: "project_123",
  typography: {
    body: "Inter",
    bodyWeight: "regular",
    heading: "Geist",
    headingWeight: "bold"
  },
  updatedAt: new Date("2026-06-18T12:03:00.000Z")
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
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Export PNG" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Slide 1 canvas")).toBeInTheDocument();
  });

  it("places properties above theme controls in the right rail", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    const propertiesLabel = screen.getByText("Properties");
    const themeEngineHeading = screen.getByRole("heading", { name: "Theme Engine" });

    expect(Boolean(propertiesLabel.compareDocumentPosition(themeEngineHeading) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(
      true
    );
  });

  it("places the creative brief builder before theme and draft generation", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    const creativeBriefHeading = screen.getByRole("heading", { name: "Creative Brief" });
    const themeEngineHeading = screen.getByRole("heading", { name: "Theme Engine" });
    const aiGenerationHeading = screen.getByRole("heading", { name: "AI Generation" });

    expect(
      Boolean(creativeBriefHeading.compareDocumentPosition(themeEngineHeading) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
    expect(
      Boolean(creativeBriefHeading.compareDocumentPosition(aiGenerationHeading) & Node.DOCUMENT_POSITION_FOLLOWING)
    ).toBe(true);
  });

  it("keeps the right inspector within the viewport with internal scrolling", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    const inspector = screen.getByLabelText("Editor inspector");

    expect(inspector).toHaveClass("lg:h-[calc(100vh-4rem)]");
    expect(inspector).toHaveClass("lg:overflow-y-auto");
    expect(inspector).toHaveClass("p-3");
  });

  it("keeps the slide rail and canvas workspace independently scrollable", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    const slideNavigator = screen.getByLabelText("Slide navigator");
    const canvasWorkspace = screen.getByLabelText("Canvas workspace");

    expect(slideNavigator).toHaveClass("lg:h-[calc(100vh-4rem)]");
    expect(slideNavigator).toHaveClass("lg:overflow-y-auto");
    expect(canvasWorkspace).toHaveClass("lg:h-full");
    expect(canvasWorkspace).toHaveClass("overflow-auto");
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

  it("edits text directly on the canvas from the selected element", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Text on Canvas" }));

    const inlineEditor = screen.getByLabelText("Edit text on canvas");

    fireEvent.change(inlineEditor, {
      target: {
        value: "Inline edited headline"
      }
    });

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);
    const textElement = canvasJson.slides[0].elements.find((element: { type: string }) => element.type === "text");

    expect(textElement).toMatchObject({
      content: "Inline edited headline"
    });

    fireEvent.blur(inlineEditor);

    expect(screen.getByRole("button", { name: "Inline edited headline" })).toBeInTheDocument();
  });

  it("starts inline text editing by double-clicking the canvas text object", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));
    fireEvent.doubleClick(screen.getByRole("button", { name: "Editable headline" }));

    expect(screen.getByLabelText("Edit text on canvas")).toHaveValue("Editable headline");
  });

  it("organizes properties into content, position, and style sections", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));

    expect(screen.getByRole("button", { name: "Content" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText("Text")).toBeInTheDocument();
    expect(screen.queryByLabelText("X")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Position" }));

    expect(screen.getByLabelText("X")).toBeInTheDocument();
    expect(screen.getByLabelText("Y")).toBeInTheDocument();
    expect(screen.getByLabelText("Width")).toBeInTheDocument();
    expect(screen.getByLabelText("Height")).toBeInTheDocument();
    expect(screen.getByLabelText("Layer")).toBeInTheDocument();
    expect(screen.queryByLabelText("Text")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Style" }));

    expect(screen.getByLabelText("Font Family")).toBeInTheDocument();
    expect(screen.getByLabelText("Opacity")).toBeInTheDocument();
    expect(screen.queryByLabelText("X")).not.toBeInTheDocument();
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

  it("renders generated image elements as selectable canvas layers", () => {
    const projectWithImage: ContentProject = {
      ...project,
      canvasJson: {
        ...project.canvasJson,
        slides: [
          {
            ...project.canvasJson.slides[0],
            elements: [
              {
                alt: "Generated roof inspection image",
                assetId: "asset_image_1",
                crop: null,
                height: 420,
                id: "image_1",
                locked: false,
                opacity: 1,
                prompt: "Generate a premium roof inspection image.",
                provider: "flux",
                rotation: 0,
                src: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
                type: "image",
                width: 620,
                x: 220,
                y: 320,
                zIndex: 1
              }
            ]
          }
        ]
      }
    };

    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={projectWithImage}
        saveAction={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Generated roof inspection image" })).toBeInTheDocument();
  });

  it("renders AI image controls for the active slide when a theme exists", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        initialTheme={theme}
        project={project}
        saveAction={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "AI Image" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Image" })).toBeEnabled();
  });

  it("uploads a user image and inserts it as an editable canvas image", async () => {
    class MockFileReader {
      onerror: null | (() => void) = null;
      onload: null | (() => void) = null;
      result: string | ArrayBuffer | null = null;

      readAsDataURL() {
        this.result = "data:image/png;base64,brandphoto";
        this.onload?.();
      }
    }

    vi.stubGlobal("FileReader", MockFileReader);

    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    const uploadInput = screen.getByLabelText("Upload image to canvas");
    const file = new File(["brand-photo"], "therapy-room.png", {
      type: "image/png"
    });

    fireEvent.change(uploadInput, {
      target: {
        files: [file]
      }
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "therapy-room.png" })).toBeInTheDocument()
    );

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);
    const imageElement = canvasJson.slides[0].elements.find((element: { type: string }) => element.type === "image");

    expect(imageElement).toMatchObject({
      alt: "therapy-room.png",
      provider: "local-image",
      src: "data:image/png;base64,brandphoto",
      type: "image"
    });
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

  it("opens an element context menu on right-click and deletes the targeted object", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));

    const textLayer = screen.getByRole("button", { name: "Editable headline" });

    fireEvent.contextMenu(textLayer, {
      clientX: 220,
      clientY: 240
    });

    expect(screen.getByRole("menu", { name: "Element actions" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("menuitem", { name: "Delete element" }));

    expect(screen.queryByRole("button", { name: "Editable headline" })).not.toBeInTheDocument();

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);

    expect(canvasJson.slides[0].elements).toHaveLength(0);
  });

  it("deletes the selected canvas object with the Delete keyboard shortcut", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));
    expect(screen.getByRole("button", { name: "Editable headline" })).toBeInTheDocument();

    fireEvent.keyDown(window, {
      key: "Delete"
    });

    expect(screen.queryByRole("button", { name: "Editable headline" })).not.toBeInTheDocument();

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);

    expect(canvasJson.slides[0].elements).toHaveLength(0);
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

  it("edits text typography and shared object styles from the inspector", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Text" }));
    fireEvent.click(screen.getByRole("button", { name: "Style" }));

    fireEvent.change(screen.getByLabelText("Font Family"), {
      target: {
        value: "Inter"
      }
    });
    fireEvent.change(screen.getByLabelText("Weight"), {
      target: {
        value: "semibold"
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "Align center" }));
    fireEvent.change(screen.getByLabelText("Line Height"), {
      target: {
        value: "1.4"
      }
    });
    fireEvent.change(screen.getByLabelText("Letter Spacing"), {
      target: {
        value: "2"
      }
    });
    fireEvent.change(screen.getByLabelText("Opacity"), {
      target: {
        value: "0.65"
      }
    });
    fireEvent.change(screen.getByLabelText("Rotation"), {
      target: {
        value: "-6"
      }
    });

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);
    const textElement = canvasJson.slides[0].elements.find((element: { type: string }) => element.type === "text");

    expect(textElement).toMatchObject({
      fontFamily: "Inter",
      fontWeight: "semibold",
      letterSpacing: 2,
      lineHeight: 1.4,
      opacity: 0.65,
      rotation: -6,
      textAlign: "center"
    });
  });

  it("edits CTA typography from the inspector", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add CTA" }));
    fireEvent.click(screen.getByRole("button", { name: "Style" }));

    fireEvent.change(screen.getByLabelText("Font Family"), {
      target: {
        value: "Inter"
      }
    });
    fireEvent.change(screen.getByLabelText("Font Size"), {
      target: {
        value: "36"
      }
    });
    fireEvent.change(screen.getByLabelText("Corner Radius"), {
      target: {
        value: "24"
      }
    });

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);
    const ctaElement = canvasJson.slides[0].elements.find((element: { type: string }) => element.type === "cta");

    expect(ctaElement).toMatchObject({
      borderRadius: 24,
      fontFamily: "Inter",
      fontSize: 36
    });
  });

  it("edits shape radius and stroke from the inspector", () => {
    render(
      <ProjectEditorShell
        initialState={initialProjectEditorSaveState}
        project={project}
        saveAction={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Add Shape" }));
    fireEvent.click(screen.getByRole("button", { name: "Style" }));

    fireEvent.change(screen.getByLabelText("Corner Radius"), {
      target: {
        value: "48"
      }
    });
    fireEvent.change(screen.getByLabelText("Stroke Color"), {
      target: {
        value: "#0B0F19"
      }
    });
    fireEvent.change(screen.getByLabelText("Stroke Width"), {
      target: {
        value: "6"
      }
    });

    const canvasJson = JSON.parse((screen.getByTestId("project-editor-canvas-json") as HTMLInputElement).value);
    const shapeElement = canvasJson.slides[0].elements.find((element: { type: string }) => element.type === "shape");

    expect(shapeElement).toMatchObject({
      borderRadius: 48,
      stroke: "#0B0F19",
      strokeWidth: 6
    });
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

    expect(screen.getByRole("button", { name: "Version History" })).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("button", { name: "Version History" }));
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

    fireEvent.click(screen.getByRole("button", { name: "Version History" }));
    fireEvent.click(screen.getByRole("button", { name: "Restore Version 1" }));

    await waitFor(() => expect(restoreVersionAction).toHaveBeenCalled());
    await waitFor(
      () => expect(screen.getByRole("button", { name: "Restored version headline" })).toBeInTheDocument(),
      {
        timeout: 5000
      }
    );
    expect(screen.getByText("Version 1 restored.")).toBeInTheDocument();
    expect(screen.getByText("Version restore")).toBeInTheDocument();
  });
});
