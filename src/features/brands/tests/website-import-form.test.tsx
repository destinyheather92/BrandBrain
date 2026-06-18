import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { WebsiteImportForm } from "../components/website-import-form";
import { initialWebsiteImportFormState } from "../types/website-import-form-state";

describe("WebsiteImportForm", () => {
  it("renders the website import fields and primary action", () => {
    render(
      <WebsiteImportForm
        action={vi.fn()}
        initialState={initialWebsiteImportFormState}
      />
    );

    expect(screen.getByRole("heading", { name: "Import brand from website" })).toBeInTheDocument();
    expect(screen.getByLabelText("Website URL")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import Website" })).toBeInTheDocument();
  });

  it("renders typed import errors from the server action", () => {
    render(
      <WebsiteImportForm
        action={vi.fn()}
        initialState={{
          fieldErrors: {
            websiteUrl: ["Enter a valid website URL."]
          },
          message: "Check the website URL and try again.",
          status: "error"
        }}
      />
    );

    expect(screen.getByText("Check the website URL and try again.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid website URL.")).toBeInTheDocument();
  });
});
