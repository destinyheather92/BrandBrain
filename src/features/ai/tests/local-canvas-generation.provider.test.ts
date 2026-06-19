import { describe, expect, it } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import { LocalCanvasGenerationProvider } from "../providers/local-canvas-generation.provider";

describe("LocalCanvasGenerationProvider", () => {
  it("keeps generated CTA labels within the canvas schema limit", async () => {
    const provider = new LocalCanvasGenerationProvider();
    const response = await provider.generateJson({
      system: "Return valid canvas JSON.",
      temperature: 0.3,
      user: JSON.stringify({
        brand: {
          memory: {
            preferredCtas: "Schedule a detailed land assessment with a senior specialist who can inspect grading drainage clearing needs brush removal access paths seasonal maintenance erosion risks site access pasture recovery storm cleanup forestry edges and long term land improvement priorities."
          },
          name: "Land Strong"
        },
        outputRules: {
          slideCount: 3
        },
        projectTitle: "Spring Land Prep",
        theme: {
          palette: {
            accent: "#D97706",
            background: "#FFFFFF",
            ctaText: "#FFFFFF",
            primary: "#14532D",
            surface: "#F8FAFC",
            text: "#0B0F19"
          },
          typography: {
            body: "Inter",
            heading: "Geist"
          }
        },
        userRequest: "Create a carousel."
      }),
      workflow: "canvas-generation"
    });
    const document = response.data as CanvasDocument;
    const cta = document.slides[0]?.elements.find((element) => element.type === "cta");

    expect(cta).toMatchObject({
      type: "cta"
    });
    expect(cta?.type === "cta" ? cta.label.length : 0).toBeLessThanOrEqual(200);
  });
});
