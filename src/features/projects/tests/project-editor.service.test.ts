import { describe, expect, it, vi } from "vitest";

import {
  addCanvasElementToSlide,
  createCanvasCtaElement,
  createCanvasShapeElement,
  createCanvasTextElement,
  normalizeEditorCanvas,
  updateCanvasElement
} from "../services/project-editor-canvas.service";
import {
  getContentProjectForEditor,
  saveProjectCanvasForUser
} from "../services/project-editor.service";
import type { ContentProject, ContentProjectRepository } from "../types/content-project";

const canvasJson = {
  documentId: "document_1",
  format: "instagram-carousel" as const,
  height: 1080,
  schemaVersion: "1.0.0" as const,
  slides: [
    {
      background: {
        color: "#0B0F19",
        type: "solid" as const
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
  unit: "px" as const,
  width: 1080
};

const project: ContentProject = {
  brandId: "brand_123",
  brandName: "ABC Roofing",
  canvasJson,
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  format: "instagram-carousel",
  id: "project_123",
  ownerUserId: "user_local_123",
  status: "draft",
  title: "Storm Damage Carousel",
  updatedAt: new Date("2026-06-18T12:00:00.000Z")
};

function createRepository(overrides: Partial<ContentProjectRepository> = {}): ContentProjectRepository {
  return {
    create: vi.fn(),
    findByIdForOwner: vi.fn().mockResolvedValue(project),
    listByOwnerUserId: vi.fn(),
    updateCanvasForOwner: vi.fn().mockResolvedValue(project),
    ...overrides
  };
}

describe("project editor canvas operations", () => {
  it("adds visual text, shape, and CTA elements to a slide", () => {
    const withText = addCanvasElementToSlide(canvasJson, "slide_1", createCanvasTextElement("text_1"));
    const withShape = addCanvasElementToSlide(withText, "slide_1", createCanvasShapeElement("shape_1"));
    const withCta = addCanvasElementToSlide(withShape, "slide_1", createCanvasCtaElement("cta_1"));

    expect(withCta.slides[0]?.elements.map((element) => element.type)).toEqual(["text", "shape", "cta"]);
    expect(withCta.slides[0]?.elements[1]).toMatchObject({
      stroke: null,
      strokeWidth: 0
    });
    expect(canvasJson.slides[0]?.elements).toEqual([]);
  });

  it("removes the legacy default cyan stroke from existing saved shapes", () => {
    const shape = createCanvasShapeElement("shape_legacy");

    if (shape.type !== "shape") {
      throw new Error("Expected shape element.");
    }

    const document = addCanvasElementToSlide(canvasJson, "slide_1", {
      ...shape,
      stroke: "#00E5FF",
      strokeWidth: 2
    });

    const normalized = normalizeEditorCanvas(document);

    expect(normalized.slides[0]?.elements[0]).toMatchObject({
      stroke: null,
      strokeWidth: 0
    });
  });

  it("updates one element while preserving existing user edits", () => {
    const document = addCanvasElementToSlide(canvasJson, "slide_1", createCanvasTextElement("text_1"));

    const updated = updateCanvasElement(document, "slide_1", "text_1", {
      content: "Edited headline",
      x: 140,
      y: 220
    });

    expect(updated.slides[0]?.elements[0]).toMatchObject({
      content: "Edited headline",
      id: "text_1",
      x: 140,
      y: 220
    });
    expect(document.slides[0]?.elements[0]).toMatchObject({
      content: "Editable headline",
      x: 96,
      y: 180
    });
  });
});

describe("project editor service", () => {
  it("loads an editor project owned by the current user", async () => {
    const repository = createRepository();

    const result = await getContentProjectForEditor({
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository: repository
    });

    expect(result).toEqual({
      ok: true,
      project,
      status: "ready"
    });
    expect(repository.findByIdForOwner).toHaveBeenCalledWith("project_123", "user_local_123");
  });

  it("saves validated canvas JSON for the current user's project", async () => {
    const repository = createRepository();
    const updatedCanvas = addCanvasElementToSlide(canvasJson, "slide_1", createCanvasTextElement("text_1"));

    const result = await saveProjectCanvasForUser({
      canvasJson: JSON.stringify(updatedCanvas),
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository: repository
    });

    expect(result).toEqual({
      ok: true,
      project,
      status: "saved"
    });
    expect(repository.updateCanvasForOwner).toHaveBeenCalledWith("project_123", "user_local_123", updatedCanvas);
  });

  it("rejects invalid canvas JSON before saving", async () => {
    const repository = createRepository();

    const result = await saveProjectCanvasForUser({
      canvasJson: JSON.stringify({
        documentId: "document_1",
        slides: []
      }),
      ownerUserId: "user_local_123",
      projectId: "project_123",
      projectRepository: repository
    });

    expect(result).toMatchObject({
      error: {
        code: "invalid_project_canvas"
      },
      ok: false,
      status: "failed"
    });
    expect(repository.updateCanvasForOwner).not.toHaveBeenCalled();
  });

  it("does not save a project outside the current user", async () => {
    const repository = createRepository({
      updateCanvasForOwner: vi.fn().mockResolvedValue(null)
    });

    const result = await saveProjectCanvasForUser({
      canvasJson: JSON.stringify(canvasJson),
      ownerUserId: "user_local_123",
      projectId: "project_other",
      projectRepository: repository
    });

    expect(result).toEqual({
      error: {
        code: "project_not_found",
        message: "Project could not be found."
      },
      ok: false,
      status: "failed"
    });
  });
});
