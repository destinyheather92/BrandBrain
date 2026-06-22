"use client";

import { Moon, Sun } from "lucide-react";

import { useAppTheme } from "./app-theme-provider";

export function AppThemeToggle() {
  const { mode, toggleThemeMode } = useAppTheme();
  const nextMode = mode === "dark" ? "light" : "dark";
  const Icon = mode === "dark" ? Sun : Moon;

  return (
    <button
      aria-label={`Switch to ${nextMode} mode`}
      aria-pressed={mode === "light"}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--bb-color-border)] bg-[var(--bb-color-surface)] px-3 py-2 text-sm font-semibold text-[var(--bb-color-text-primary)] transition hover:border-[var(--bb-color-primary)]"
      data-testid="app-theme-toggle"
      onClick={toggleThemeMode}
      type="button"
    >
      <Icon aria-hidden="true" className="h-4 w-4 text-[var(--bb-color-primary)]" />
      <span className="hidden sm:inline">{mode === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
