import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandBrainAuthShell } from "../components/brandbrain-auth-shell";

describe("BrandBrainAuthShell", () => {
  it("renders the sign-in frame with BrandBrain positioning", () => {
    render(
      <BrandBrainAuthShell mode="sign-in">
        <div data-testid="clerk-slot" />
      </BrandBrainAuthShell>
    );

    expect(screen.getByRole("img", { name: "BrandBrain" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to your BrandBrain account")).toBeInTheDocument();
    expect(screen.getByTestId("clerk-slot")).toBeInTheDocument();
  });

  it("renders the sign-up frame without chatbot positioning language", () => {
    render(
      <BrandBrainAuthShell mode="sign-up">
        <div data-testid="clerk-slot" />
      </BrandBrainAuthShell>
    );

    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByText("Start building your brand and content system")).toBeInTheDocument();
    expect(screen.queryByText(/chatbot/i)).not.toBeInTheDocument();
  });
});
