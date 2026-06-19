import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import { AiGenerationPanel } from "../components/ai-generation-panel";
import { initialAiGenerationActionState } from "../types/ai-generation-action-state";

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

describe("AiGenerationPanel", () => {
  it("renders the generation controls when a theme exists", () => {
    const { container } = render(
      <AiGenerationPanel
        generationAction={vi.fn()}
        hasTheme={true}
        initialState={initialAiGenerationActionState}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    expect(screen.getByRole("heading", { name: "AI Generation" })).toBeInTheDocument();
    expect(screen.getByLabelText("Generation request")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Draft Slides" })).toBeInTheDocument();
    expect(container.querySelector('input[name="projectId"]')).toHaveValue("project_1");
  });

  it("blocks generation until a project theme exists", () => {
    render(
      <AiGenerationPanel
        generationAction={vi.fn()}
        hasTheme={false}
        initialState={initialAiGenerationActionState}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    expect(screen.getByRole("button", { name: "Generate Draft Slides" })).toBeDisabled();
    expect(screen.getByText("Generate and apply a theme before creating AI slides.")).toBeInTheDocument();
  });

  it("keeps the generation request in form data while generation is blocked", () => {
    render(
      <AiGenerationPanel
        generationAction={vi.fn()}
        hasTheme={false}
        initialState={initialAiGenerationActionState}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    const requestField = screen.getByLabelText("Generation request");
    const form = requestField.closest("form");

    expect(requestField).not.toBeDisabled();
    expect(requestField).toHaveAttribute("readonly");
    expect(form).not.toBeNull();
    expect(new FormData(form as HTMLFormElement).get("userRequest")).toBe(
      "Create a 3-slide brand-consistent carousel for this project."
    );
  });

  it("applies a generated canvas only once when the parent callback identity changes", () => {
    const initialState = {
      canvasJson: generatedCanvas,
      message: "AI draft generated.",
      status: "generated" as const
    };
    const firstOnGenerated = vi.fn();
    const { rerender } = render(
      <AiGenerationPanel
        generationAction={vi.fn()}
        hasTheme={true}
        initialState={initialState}
        onGenerated={firstOnGenerated}
        projectId="project_1"
      />
    );
    const secondOnGenerated = vi.fn();

    expect(firstOnGenerated).toHaveBeenCalledTimes(1);

    rerender(
      <AiGenerationPanel
        generationAction={vi.fn()}
        hasTheme={true}
        initialState={initialState}
        onGenerated={secondOnGenerated}
        projectId="project_1"
      />
    );

    expect(firstOnGenerated).toHaveBeenCalledTimes(1);
    expect(secondOnGenerated).not.toHaveBeenCalled();
  });
});
