import type { BrandRepository } from "@/features/brands/types/brand";
import { canvasDocumentSchema } from "@/features/canvas/schemas/canvas-object.schema";
import type { CanvasDocument, CanvasElement } from "@/features/canvas/types/canvas";
import { contentProjectCreateForUserInputSchema } from "@/features/projects/schemas/content-project.schema";
import type { ContentProjectRepository } from "@/features/projects/types/content-project";

import { contentTemplates } from "../data/content-templates";
import { templateProjectCreateInputSchema } from "../schemas/template.schema";
import type { ContentTemplate, TemplateProjectCreateInput, TemplateProjectCreateResult } from "../types/template";

type CanvasIdScope = "document" | "element" | "slide";

type CreateProjectFromTemplateForUserParams = {
  brandRepository: BrandRepository;
  idFactory?: (scope?: CanvasIdScope) => string;
  input: TemplateProjectCreateInput;
  ownerUserId: string;
  projectRepository: ContentProjectRepository;
};

export function listContentTemplates(): ContentTemplate[] {
  return contentTemplates.map((template) => ({
    ...template,
    canvasJson: canvasDocumentSchema.parse(structuredClone(template.canvasJson))
  }));
}

export async function createProjectFromTemplateForUser({
  brandRepository,
  idFactory = createCanvasId,
  input,
  ownerUserId,
  projectRepository
}: CreateProjectFromTemplateForUserParams): Promise<TemplateProjectCreateResult> {
  const parsed = templateProjectCreateInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        code: "invalid_template_input",
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Check the template details and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  const template = contentTemplates.find((candidate) => candidate.id === parsed.data.templateId);

  if (!template) {
    return {
      error: {
        code: "template_not_found",
        message: "Choose an available template."
      },
      ok: false,
      status: "failed"
    };
  }

  try {
    const brand = await brandRepository.findByIdForOwner(parsed.data.brandId, ownerUserId);

    if (!brand) {
      return {
        error: {
          code: "brand_not_found",
          message: "Choose one of your brands before using a template."
        },
        ok: false,
        status: "failed"
      };
    }

    const canvasJson = cloneTemplateCanvas(template.canvasJson, parsed.data.title, idFactory);
    const createInput = contentProjectCreateForUserInputSchema.parse({
      brandId: parsed.data.brandId,
      canvasJson,
      format: canvasJson.format,
      ownerUserId,
      status: "draft",
      title: parsed.data.title
    });
    const project = await projectRepository.create(createInput);

    return {
      ok: true,
      project,
      status: "created"
    };
  } catch (error) {
    return mapRepositoryError(error);
  }
}

function cloneTemplateCanvas(
  templateCanvas: CanvasDocument,
  title: string,
  idFactory: (scope?: CanvasIdScope) => string
): CanvasDocument {
  return canvasDocumentSchema.parse({
    ...templateCanvas,
    documentId: idFactory("document"),
    slides: templateCanvas.slides.map((slide) => {
      const slideId = idFactory("slide");

      return {
        ...slide,
        elements: slide.elements.map((element) => cloneTemplateElement(element, idFactory)),
        id: slideId
      };
    }),
    title: title.trim()
  });
}

function cloneTemplateElement(
  element: CanvasElement,
  idFactory: (scope?: CanvasIdScope) => string
): CanvasElement {
  return {
    ...element,
    id: idFactory("element")
  };
}

function createCanvasId(scope: CanvasIdScope = "element"): string {
  const randomId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);

  return `${scope}_${randomId}`;
}

function isMissingPrismaDelegateError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes("Cannot read properties of undefined");
}

function mapRepositoryError(error: unknown): TemplateProjectCreateResult {
  if (isMissingPrismaDelegateError(error)) {
    return {
      error: {
        code: "project_repository_unavailable",
        message: "Project storage is not loaded. Restart the local server and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  console.error("Template project creation failed.", error);

  return {
    error: {
      code: "project_repository_error",
      message: "Template project could not be created."
    },
    ok: false,
    status: "failed"
  };
}
