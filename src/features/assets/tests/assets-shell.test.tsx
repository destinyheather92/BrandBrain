import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AssetsShell } from "../components/assets-shell";
import type { Asset } from "../types/asset";

const asset: Asset = {
  brandId: "brand_1",
  brandName: "Land Strong",
  createdAt: new Date("2026-06-21T10:00:00.000Z"),
  height: 520,
  id: "asset_1",
  kind: "generated-image",
  mimeType: "image/svg+xml",
  name: "Freshly graded land at sunrise",
  ownerUserId: "user_1",
  projectId: "project_1",
  projectTitle: "Spring Land Prep Carousel",
  prompt: "Generate marketing photography of freshly graded land at sunrise.",
  provider: "flux",
  sizeBytes: null,
  sourceUrl: "data:image/svg+xml,%3Csvg%3E%3C/svg%3E",
  updatedAt: new Date("2026-06-21T10:00:00.000Z"),
  width: 888
};

describe("AssetsShell", () => {
  it("renders upload-ready controls and saved asset cards", () => {
    render(<AssetsShell accountControl={<button type="button">Account</button>} assets={[asset]} />);

    expect(screen.getByRole("heading", { name: "Assets" })).toBeInTheDocument();
    expect(screen.getByText("UploadThing-ready intake")).toBeInTheDocument();
    expect(screen.getByText("Freshly graded land at sunrise")).toBeInTheDocument();
    expect(screen.getByText("Land Strong")).toBeInTheDocument();
    expect(screen.getByText("Flux")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Freshly graded land at sunrise" })).toBeInTheDocument();
  });

  it("renders an empty state before assets exist", () => {
    render(<AssetsShell accountControl={null} assets={[]} />);

    expect(screen.getByText("No assets yet")).toBeInTheDocument();
    expect(screen.getByText("Generated images and uploaded brand files will appear here.")).toBeInTheDocument();
  });
});
