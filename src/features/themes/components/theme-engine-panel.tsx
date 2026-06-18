"use client";

import { Palette, Sparkles } from "lucide-react";
import { useActionState, useEffect, useMemo } from "react";

import type { ProjectTheme } from "../types/project-theme";
import type { ProjectThemeAction, ProjectThemeActionState } from "../types/project-theme-action-state";

type ThemeEnginePanelProps = {
  initialState: ProjectThemeActionState;
  initialTheme: ProjectTheme | null;
  onApplyTheme: (theme: ProjectTheme) => void;
  onThemeGenerated?: (theme: ProjectTheme) => void;
  projectId: string;
  themeAction: ProjectThemeAction;
};

export function ThemeEnginePanel({
  initialState,
  initialTheme,
  onApplyTheme,
  onThemeGenerated,
  projectId,
  themeAction
}: ThemeEnginePanelProps) {
  const [state, formAction, pending] = useActionState(themeAction, initialState);
  const activeTheme = state.theme ?? initialTheme;
  const swatches = useMemo(
    () =>
      activeTheme
        ? [
            {
              label: "Primary",
              value: activeTheme.palette.primary
            },
            {
              label: "Accent",
              value: activeTheme.palette.accent
            },
            {
              label: "Surface",
              value: activeTheme.palette.surface
            }
          ]
        : [],
    [activeTheme]
  );

  useEffect(() => {
    if (!state.theme) {
      return;
    }

    onThemeGenerated?.(state.theme);
  }, [onThemeGenerated, state.theme]);

  return (
    <section className="rounded-lg border border-[#263244] bg-[#0B0F19] p-4" aria-label="Theme Engine">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
            <h2>Theme Engine</h2>
          </div>
          <p className="mt-1 text-xs uppercase text-[#94A3B8]">Generated before slides</p>
        </div>
        <Palette aria-hidden="true" className="h-5 w-5 text-[#CBD5E1]" />
      </div>

      <form action={formAction} className="mt-4">
        <input name="projectId" type="hidden" value={projectId} />
        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#00E5FF] px-3 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {pending ? "Generating..." : activeTheme ? "Regenerate Theme" : "Generate Theme"}
        </button>
      </form>

      {state.message ? (
        <p className={state.status === "error" ? "mt-3 text-sm text-[#EF4444]" : "mt-3 text-sm text-[#22C55E]"}>
          {state.message}
        </p>
      ) : null}

      {activeTheme ? (
        <div className="mt-4 grid gap-4">
          <div className="grid grid-cols-3 gap-2">
            {swatches.map((swatch) => (
              <div key={swatch.label} className="rounded-lg border border-[#263244] bg-[#141A26] p-2">
                <div className="h-8 rounded-md border border-[#263244]" style={{ backgroundColor: swatch.value }} />
                <p className="mt-2 text-[11px] uppercase text-[#94A3B8]">{swatch.label}</p>
                <p className="text-xs font-medium text-[#F8FAFC]">{swatch.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-[#263244] bg-[#141A26] p-3 text-sm">
            <p className="text-[#94A3B8]">Typography</p>
            <p className="mt-1 font-medium text-[#F8FAFC]">
              {activeTheme.typography.heading} heading / {activeTheme.typography.body} body
            </p>
          </div>

          <div className="rounded-lg border border-[#263244] bg-[#141A26] p-3 text-sm">
            <p className="text-[#94A3B8]">Layout</p>
            <p className="mt-1 font-medium text-[#F8FAFC]">{activeTheme.layout.heroTreatment}</p>
            <p className="mt-1 text-xs text-[#94A3B8]">
              {activeTheme.layout.density} / {activeTheme.layout.spacingScale}
            </p>
          </div>

          <div className="rounded-lg border border-[#263244] bg-[#141A26] p-3 text-sm">
            <p className="text-[#94A3B8]">Image Style</p>
            <p className="mt-1 text-[#CBD5E1]">{activeTheme.imageStyle}</p>
          </div>

          <button
            className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#263244] px-3 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
            onClick={() => onApplyTheme(activeTheme)}
            type="button"
          >
            Apply Theme to Canvas
          </button>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-[#263244] bg-[#141A26] p-3 text-sm text-[#CBD5E1]">
          Generate a brand-aware theme before creating AI slides.
        </p>
      )}
    </section>
  );
}
