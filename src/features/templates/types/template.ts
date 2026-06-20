import type { Brand } from "@/features/brands/types/brand";
import type { CanvasDocument } from "@/features/canvas/types/canvas";
import type { ContentProject } from "@/features/projects/types/content-project";

export type ContentTemplate = {
  canvasJson: CanvasDocument;
  category: string;
  description: string;
  id: string;
  name: string;
  recommendedUse: string;
};

export type TemplateProjectCreateInput = {
  brandId: string;
  templateId: string;
  title: string;
};

export type TemplateProjectCreateResult =
  | {
      ok: true;
      project: ContentProject;
      status: "created";
    }
  | {
      error: {
        code:
          | "brand_not_found"
          | "invalid_template_input"
          | "project_repository_error"
          | "project_repository_unavailable"
          | "template_not_found";
        fieldErrors?: Partial<Record<keyof TemplateProjectCreateInput, string[]>>;
        message: string;
      };
      ok: false;
      status: "failed";
    };

export type TemplatesShellBrand = Pick<Brand, "id" | "name">;
