import type { BrandRepository } from "@/features/brands/types/brand";
import { createBlankCanvasDocument } from "@/features/canvas/services/canvas-object-model.service";

import { contentProjectCreateForUserInputSchema, contentProjectCreateInputSchema } from "../schemas/content-project.schema";
import type {
  ContentProjectCreateFormInput,
  ContentProjectCreateResult,
  ContentProjectListResult,
  ContentProjectRepository
} from "../types/content-project";

type CreateContentProjectForUserParams = {
  brandRepository: BrandRepository;
  idFactory?: () => string;
  input: ContentProjectCreateFormInput;
  ownerUserId: string;
  projectRepository: ContentProjectRepository;
};

type ListContentProjectsForUserParams = {
  ownerUserId: string;
  projectRepository: ContentProjectRepository;
};

function isMissingPrismaDelegateError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes("Cannot read properties of undefined");
}

function mapRepositoryError(error: unknown): ContentProjectCreateResult {
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

  console.error("Content project repository failed.", error);

  return {
    error: {
      code: "project_repository_error",
      message: "Project could not be saved."
    },
    ok: false,
    status: "failed"
  };
}

function mapListRepositoryError(error: unknown): ContentProjectListResult {
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

  console.error("Content project listing failed.", error);

  return {
    error: {
      code: "project_repository_error",
      message: "Projects could not be loaded."
    },
    ok: false,
    status: "failed"
  };
}

export async function createContentProjectForUser({
  brandRepository,
  idFactory,
  input,
  ownerUserId,
  projectRepository
}: CreateContentProjectForUserParams): Promise<ContentProjectCreateResult> {
  const parsed = contentProjectCreateInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        code: "invalid_project_input",
        fieldErrors: parsed.error.flatten().fieldErrors,
        message: "Check the project details and try again."
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
          message: "Choose one of your brands before creating a project."
        },
        ok: false,
        status: "failed"
      };
    }

    const canvasJson = createBlankCanvasDocument({
      format: parsed.data.format,
      idFactory,
      slideCount: parsed.data.slideCount,
      title: parsed.data.title
    });

    const createInput = contentProjectCreateForUserInputSchema.parse({
      ...parsed.data,
      canvasJson,
      ownerUserId,
      status: "draft"
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

export async function listContentProjectsForUser({
  ownerUserId,
  projectRepository
}: ListContentProjectsForUserParams): Promise<ContentProjectListResult> {
  try {
    const projects = await projectRepository.listByOwnerUserId(ownerUserId);

    return {
      ok: true,
      projects,
      status: "ready"
    };
  } catch (error) {
    return mapListRepositoryError(error);
  }
}
