import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { initialProjectThemeActionState } from "../types/project-theme-action-state";
import type { ProjectTheme } from "../types/project-theme";
import { ThemeEnginePanel } from "../components/theme-engine-panel";

const theme: ProjectTheme = {
  brandId: "brand_1",
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  id: "theme_1",
  imageStyle: "Crisp exterior photography with storm-ready contrast and professional lighting.",
  layout: {
    density: "editorial",
    heroTreatment: "large-headline-left",
    spacingScale: "comfortable"
  },
  name: "ABC Roofing Theme",
  ownerUserId: "user_1",
  palette: {
    accent: "#00A6FB",
    background: "#FFFFFF",
    ctaText: "#FFFFFF",
    primary: "#0F172A",
    secondary: "#E2E8F0",
    surface: "#F8FAFC",
    text: "#0B0F19"
  },
  projectId: "project_1",
  typography: {
    body: "Inter",
    bodyWeight: "regular",
    heading: "Geist",
    headingWeight: "bold"
  },
  updatedAt: new Date("2026-06-18T12:00:00.000Z")
};

describe("ThemeEnginePanel", () => {
  it("shows the generated theme and applies it to the canvas on request", () => {
    const onApplyTheme = vi.fn();
    const { container } = render(
      <ThemeEnginePanel
        initialState={initialProjectThemeActionState}
        initialTheme={theme}
        onApplyTheme={onApplyTheme}
        projectId="project_1"
        themeAction={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Theme Engine" })).toBeInTheDocument();
    expect(screen.getByText("Generated before slides")).toBeInTheDocument();
    expect(screen.getByText("#0F172A")).toBeInTheDocument();
    expect(screen.getByText("#00A6FB")).toBeInTheDocument();
    expect(screen.getByText("Geist heading / Inter body")).toBeInTheDocument();
    expect(screen.getByText("large-headline-left")).toBeInTheDocument();
    expect(container.querySelector('input[name="projectId"]')).toHaveValue("project_1");

    fireEvent.click(screen.getByRole("button", { name: "Apply Theme to Canvas" }));

    expect(onApplyTheme).toHaveBeenCalledWith(theme);
  });

  it("prompts users to generate a theme when the project does not have one yet", () => {
    render(
      <ThemeEnginePanel
        initialState={initialProjectThemeActionState}
        initialTheme={null}
        onApplyTheme={vi.fn()}
        projectId="project_1"
        themeAction={vi.fn()}
      />
    );

    expect(screen.getByText("Generate a brand-aware theme before creating AI slides.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate Theme" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Apply Theme to Canvas" })).not.toBeInTheDocument();
  });
});
