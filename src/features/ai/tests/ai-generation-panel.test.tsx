import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AiGenerationPanel } from "../components/ai-generation-panel";
import { initialAiGenerationActionState } from "../types/ai-generation-action-state";

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
});
