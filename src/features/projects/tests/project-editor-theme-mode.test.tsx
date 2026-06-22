import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppThemeProvider } from "@/features/app-theme/components/app-theme-provider";
import type { ContentProject } from "@/features/projects/types/content-project";

import { ProjectEditorShell } from "../components/project-editor-shell";
import { initialProjectEditorSaveState } from "../types/project-editor-form-state";

const project: ContentProject = {
  brandId: "brand_123",
  brandName: "Harbor Counseling",
  canvasJson: {
    documentId: "document_1",
    format: "instagram-carousel",
    height: 1080,
    schemaVersion: "1.0.0",
    slides: [
      {
        background: {
          color: "#F7F3E8",
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
    title: "Anxiety Support",
    unit: "px",
    width: 1080
  },
  createdAt: new Date("2026-06-22T12:00:00.000Z"),
  format: "instagram-carousel",
  id: "project_123",
  ownerUserId: "user_local_123",
  status: "draft",
  title: "Anxiety Support",
  updatedAt: new Date("2026-06-22T12:00:00.000Z")
};

describe("ProjectEditorShell app theme mode", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.className = "";
  });

  it("does not change canvas JSON slide backgrounds when app theme mode changes", async () => {
    render(
      <AppThemeProvider>
        <ProjectEditorShell
          initialState={initialProjectEditorSaveState}
          project={project}
          saveAction={vi.fn()}
        />
      </AppThemeProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "light"));

    const canvasJsonInput = screen.getByTestId("project-editor-canvas-json") as HTMLInputElement;
    const canvasJson = JSON.parse(canvasJsonInput.value) as ContentProject["canvasJson"];

    expect(canvasJson.slides[0]?.background.color).toBe("#F7F3E8");
  });
});
