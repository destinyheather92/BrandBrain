import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";

import {
  AppThemeProvider,
  appThemeStorageKey
} from "../components/app-theme-provider";
import { AppThemeToggle } from "../components/app-theme-toggle";

function renderThemeToggle() {
  render(
    <AppThemeProvider>
      <AppThemeToggle />
    </AppThemeProvider>
  );
}

describe("AppThemeProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.className = "";
  });

  it("defaults BrandBrain to dark mode", async () => {
    renderThemeToggle();

    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "dark"));
    expect(document.documentElement).toHaveClass("bb-theme-dark");
  });

  it("switches the app chrome to light mode", async () => {
    renderThemeToggle();

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "light"));
    expect(document.documentElement).toHaveClass("bb-theme-light");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toHaveAttribute("aria-pressed", "true");
  });

  it("persists the selected mode to localStorage", async () => {
    renderThemeToggle();

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    await waitFor(() => expect(window.localStorage.getItem(appThemeStorageKey)).toBe("light"));
  });

  it("restores the selected mode on the next render", async () => {
    window.localStorage.setItem(appThemeStorageKey, "light");

    renderThemeToggle();

    await waitFor(() => expect(document.documentElement).toHaveAttribute("data-theme", "light"));
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
  });

  it("shows the toggle in the protected dashboard UI", () => {
    render(
      <AppThemeProvider>
        <DashboardShell
          accountControl={<button aria-label="Account menu">JS</button>}
          displayName="John"
          email="john@example.com"
          syncStatus="active"
        />
      </AppThemeProvider>
    );

    expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
  });
});
