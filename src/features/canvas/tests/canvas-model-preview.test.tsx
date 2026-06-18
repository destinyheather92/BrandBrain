import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CanvasModelPreview } from "../components/canvas-model-preview";
import { createBlankCanvasDocument } from "../services/canvas-object-model.service";

describe("CanvasModelPreview", () => {
  it("renders document metadata, slide thumbnails, and JSON source", () => {
    const document = createBlankCanvasDocument({
      idFactory: createIdFactory(["document_1", "slide_1", "slide_2", "slide_3"]),
      slideCount: 3,
      title: "Storm Damage Carousel"
    });

    render(<CanvasModelPreview document={document} />);

    expect(screen.getByRole("heading", { name: "Canvas Object Model" })).toBeInTheDocument();
    expect(screen.getByText("Storm Damage Carousel")).toBeInTheDocument();
    expect(screen.getByText("1080 x 1080 px")).toBeInTheDocument();
    expect(screen.getByText("3 slides")).toBeInTheDocument();
    expect(screen.getAllByText("Slide 1")).toHaveLength(2);
    expect(screen.getAllByText("Slide 2")).toHaveLength(2);
    expect(screen.getAllByText("Slide 3")).toHaveLength(2);
    expect(screen.getByText("Canvas JSON")).toBeInTheDocument();
    expect(screen.getByText(/"schemaVersion": "1.0.0"/)).toBeInTheDocument();
  });
});

function createIdFactory(ids: string[]) {
  return () => {
    const id = ids.shift();

    if (!id) {
      throw new Error("No test IDs left.");
    }

    return id;
  };
}
