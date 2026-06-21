import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import { ExportPanel } from "../components/export-panel";

const document: CanvasDocument = {
  documentId: "document_1",
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
      id: "slide_1",
      name: "Slide 1",
      order: 1,
      width: 1080
    }
  ],
  themeId: null,
  title: "Storm Damage Carousel",
  unit: "px",
  width: 1080
};

describe("ExportPanel", () => {
  it("offers PNG, JPG, and PDF exports for the current canvas document", async () => {
    const exportDocument = vi.fn().mockResolvedValue(undefined);

    render(
      <ExportPanel
        document={document}
        exportDocument={exportDocument}
        projectTitle="Storm Damage Carousel"
      />
    );

    expect(screen.getByRole("button", { name: "Export" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("button", { name: "Export PNG" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export" }));

    expect(screen.getByRole("button", { name: "Export PNG" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export JPG" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Export JPG" }));

    await waitFor(() =>
      expect(exportDocument).toHaveBeenCalledWith({
        document,
        format: "jpg",
        projectTitle: "Storm Damage Carousel"
      })
    );
    expect(await screen.findByText("JPG export started.")).toBeInTheDocument();
  });
});
