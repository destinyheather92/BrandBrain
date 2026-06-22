import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CreativeBriefPanel } from "../components/creative-brief-panel";
import { initialCreativeBriefActionState } from "../types/creative-brief-action-state";

describe("CreativeBriefPanel", () => {
  it("renders the creative brief builder controls", () => {
    const { container } = render(
      <CreativeBriefPanel
        briefAction={vi.fn()}
        initialState={initialCreativeBriefActionState}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    expect(screen.getByRole("heading", { name: "Creative Brief" })).toBeInTheDocument();
    expect(screen.getByLabelText("Idea")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Build Brief" })).toBeInTheDocument();
    expect(container.querySelector('input[name="projectId"]')).toHaveValue("project_1");
  });

  it("shows the generated strategy fields", () => {
    render(
      <CreativeBriefPanel
        briefAction={vi.fn()}
        initialState={{
          brief: {
            angle: "Normalize anxiety signals and offer one grounded next step.",
            audience: "Adults navigating anxiety and burnout",
            cta: "Schedule a consultation",
            goal: "Help adults understand anxiety spikes without shame.",
            hook: "An anxiety spike is a signal, not a personal failure."
          },
          message: "Creative brief ready.",
          status: "generated"
        }}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    expect(screen.getByText("Goal")).toBeInTheDocument();
    expect(screen.getByText("Help adults understand anxiety spikes without shame.")).toBeInTheDocument();
    expect(screen.getByText("Audience")).toBeInTheDocument();
    expect(screen.getByText("Adults navigating anxiety and burnout")).toBeInTheDocument();
    expect(screen.getByText("Angle")).toBeInTheDocument();
    expect(screen.getByText("Hook")).toBeInTheDocument();
    expect(screen.getByText("CTA")).toBeInTheDocument();
    expect(screen.getByText("Schedule a consultation")).toBeInTheDocument();
  });

  it("notifies the editor when a new brief is available", () => {
    const onGenerated = vi.fn();

    render(
      <CreativeBriefPanel
        briefAction={vi.fn()}
        initialState={{
          brief: {
            angle: "Use a calm counseling frame.",
            audience: "Adults managing nervous system overwhelm",
            cta: "Schedule a consultation",
            goal: "Create a practical anxiety support carousel.",
            hook: "When anxiety spikes, start with one steady breath."
          },
          message: "Creative brief ready.",
          status: "generated"
        }}
        onGenerated={onGenerated}
        projectId="project_1"
      />
    );

    expect(onGenerated).toHaveBeenCalledWith(
      expect.objectContaining({
        cta: "Schedule a consultation",
        hook: "When anxiety spikes, start with one steady breath."
      })
    );
  });

  it("keeps the idea available in submitted form data", () => {
    render(
      <CreativeBriefPanel
        briefAction={vi.fn()}
        initialState={initialCreativeBriefActionState}
        onGenerated={vi.fn()}
        projectId="project_1"
      />
    );

    const idea = screen.getByLabelText("Idea");
    const form = idea.closest("form");

    fireEvent.change(idea, {
      target: {
        value: "Create a carousel about what to do when anxiety spikes."
      }
    });

    expect(form).not.toBeNull();
    expect(new FormData(form as HTMLFormElement).get("userRequest")).toBe(
      "Create a carousel about what to do when anxiety spikes."
    );
  });
});
