import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import { AiImageGenerationPanel } from "../components/ai-image-generation-panel";
import { initialAiImageGenerationActionState } from "../types/ai-image-generation-action-state";

const generatedCanvas: CanvasDocument = {
  documentId: "document_generated",
  format: "instagram-carousel",
  height: 1080,
  schemaVersion: "1.0.0",
  slides: [
    {
      background: {
        color: "#FFFFFF",
        type: "solid"
      },
      elements: [],
      height: 1080,
      id: "slide_generated_1",
      name: "Slide 1",
      order: 1,
      width: 1080
    }
  ],
  themeId: "theme_1",
  title: "Generated Draft",
  unit: "px",
  width: 1080
};

describe("AiImageGenerationPanel", () => {
  it("renders image generation controls for the active slide", () => {
    const { container } = render(
      <AiImageGenerationPanel
        activeSlideId="slide_1"
        hasTheme={true}
        imageGenerationAction={vi.fn()}
        initialState={initialAiImageGenerationActionState}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    expect(screen.getByRole("heading", { name: "AI Image" })).toBeInTheDocument();
    expect(screen.getByLabelText("Image prompt")).toBeInTheDocument();
    expect(screen.getByLabelText("Image provider")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Image" })).toBeInTheDocument();
    expect(container.querySelector('input[name="projectId"]')).toHaveValue("project_1");
    expect(container.querySelector('input[name="slideId"]')).toHaveValue("slide_1");
  });

  it("blocks image generation until a project theme exists", () => {
    render(
      <AiImageGenerationPanel
        activeSlideId="slide_1"
        hasTheme={false}
        imageGenerationAction={vi.fn()}
        initialState={initialAiImageGenerationActionState}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    expect(screen.getByRole("button", { name: "Generate Image" })).toBeDisabled();
    expect(screen.getByText("Generate and apply a theme before creating images.")).toBeInTheDocument();
  });

  it("applies generated canvas JSON once", () => {
    const initialState = {
      canvasJson: generatedCanvas,
      message: "AI image generated.",
      status: "generated" as const
    };
    const firstOnGenerated = vi.fn();
    const { rerender } = render(
      <AiImageGenerationPanel
        activeSlideId="slide_1"
        hasTheme={true}
        imageGenerationAction={vi.fn()}
        initialState={initialState}
        onGenerated={firstOnGenerated}
        projectId="project_1"
      />
    );
    const secondOnGenerated = vi.fn();

    expect(firstOnGenerated).toHaveBeenCalledTimes(1);

    rerender(
      <AiImageGenerationPanel
        activeSlideId="slide_1"
        hasTheme={true}
        imageGenerationAction={vi.fn()}
        initialState={initialState}
        onGenerated={secondOnGenerated}
        projectId="project_1"
      />
    );

    expect(firstOnGenerated).toHaveBeenCalledTimes(1);
    expect(secondOnGenerated).not.toHaveBeenCalled();
  });
});
