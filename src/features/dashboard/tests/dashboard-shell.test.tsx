import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardShell } from "../components/dashboard-shell";

describe("DashboardShell", () => {
  it("renders the protected dashboard workspace for a signed-in user", () => {
    render(
      <DashboardShell
        accountControl={<button aria-label="Account menu">JS</button>}
        displayName="John"
        email="john@example.com"
        syncDetail="Synced from Clerk"
        syncStatus="active"
      />
    );

    expect(screen.getByRole("heading", { name: "Welcome back, John" })).toBeInTheDocument();
    expect(screen.getByText("Here's what's happening with your brands and content.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Account menu" })).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Local sync active")).toBeInTheDocument();
    expect(screen.getByText("Synced from Clerk")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: "Import Brand" })).toHaveAttribute("href", "/brands/import");
    expect(screen.getByRole("link", { name: "Create Carousel" })).toHaveAttribute("href", "/canvas");
    expect(screen.queryByText(/chatbot/i)).not.toBeInTheDocument();
  });

  it("keeps future feature areas visibly locked to dashboard placeholders", () => {
    render(
      <DashboardShell
        accountControl={<button aria-label="Account menu">JS</button>}
        displayName="Avery"
        email="avery@example.com"
        syncStatus="needs-database"
      />
    );

    expect(screen.getAllByText("Brands").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Projects").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Content Ideas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Exports").length).toBeGreaterThan(0);
  });
});
