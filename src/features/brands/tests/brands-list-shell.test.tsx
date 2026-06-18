import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandsListShell } from "../components/brands-list-shell";
import type { Brand } from "../types/brand";

const brand: Brand = {
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  description: "Storm restoration, inspections, and roof replacements.",
  id: "brand_123",
  industry: "Roofing",
  name: "ABC Roofing",
  ownerUserId: "user_local_123",
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
  websiteUrl: "https://abcroofing.com/"
};

describe("BrandsListShell", () => {
  it("links each brand to its persistent memory", () => {
    render(<BrandsListShell brands={[brand]} />);

    expect(screen.getByRole("link", { name: "Memory for ABC Roofing" })).toHaveAttribute(
      "href",
      "/brands/brand_123/memory"
    );
  });
});
