import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BrandCreateForm } from "../components/brand-create-form";

describe("BrandCreateForm", () => {
  it("renders the brand creation fields and primary action", () => {
    render(
      <BrandCreateForm
        action={vi.fn()}
        initialState={{ fieldErrors: {}, status: "idle" }}
      />
    );

    expect(screen.getByRole("heading", { name: "Create a brand" })).toBeInTheDocument();
    expect(screen.getByLabelText("Brand name")).toBeInTheDocument();
    expect(screen.getByLabelText("Website URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Industry")).toBeInTheDocument();
    expect(screen.getByLabelText("Brand description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Brand" })).toBeInTheDocument();
  });

  it("renders validation feedback returned by the server action", () => {
    render(
      <BrandCreateForm
        action={vi.fn()}
        initialState={{
          fieldErrors: {
            name: ["Brand name is required."]
          },
          message: "Check the brand details and try again.",
          status: "error"
        }}
      />
    );

    expect(screen.getByText("Check the brand details and try again.")).toBeInTheDocument();
    expect(screen.getByText("Brand name is required.")).toBeInTheDocument();
  });
});
