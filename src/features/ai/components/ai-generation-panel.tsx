"use client";

import { FileText, WandSparkles } from "lucide-react";
import { useActionState, useEffect } from "react";

import type { CanvasDocument } from "@/features/canvas/types/canvas";

import type { AiGenerationAction, AiGenerationActionState } from "../types/ai-generation-action-state";

type AiGenerationPanelProps = {
  generationAction: AiGenerationAction;
  hasTheme: boolean;
  initialState: AiGenerationActionState;
  onGenerated: (document: CanvasDocument) => void;
  projectId: string;
};

export function AiGenerationPanel({
  generationAction,
  hasTheme,
  initialState,
  onGenerated,
  projectId
}: AiGenerationPanelProps) {
  const [state, formAction, pending] = useActionState(generationAction, initialState);

  useEffect(() => {
    if (!state.canvasJson) {
      return;
    }

    onGenerated(state.canvasJson);
  }, [onGenerated, state.canvasJson]);

  return (
    <section className="rounded-lg border border-[#263244] bg-[#0B0F19] p-4" aria-label="AI Generation">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
            <WandSparkles aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
            <h2>AI Generation</h2>
          </div>
          <p className="mt-1 text-xs uppercase text-[#94A3B8]">Editable canvas draft</p>
        </div>
        <FileText aria-hidden="true" className="h-5 w-5 text-[#CBD5E1]" />
      </div>

      <form action={formAction} className="mt-4 grid gap-3">
        <input name="projectId" type="hidden" value={projectId} />
        <label className="text-sm text-[#CBD5E1]" htmlFor="ai-generation-request">
          Generation request
        </label>
        <textarea
          aria-disabled={!hasTheme || pending}
          className="min-h-24 resize-y rounded-lg border border-[#263244] bg-[#141A26] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
          defaultValue="Create a 3-slide brand-consistent carousel for this project."
          id="ai-generation-request"
          maxLength={1000}
          name="userRequest"
          readOnly={!hasTheme || pending}
        />

        {!hasTheme ? (
          <p className="rounded-lg border border-[#263244] bg-[#141A26] p-3 text-sm text-[#CBD5E1]">
            Generate and apply a theme before creating AI slides.
          </p>
        ) : null}

        {state.message ? (
          <p className={state.status === "error" ? "text-sm text-[#EF4444]" : "text-sm text-[#22C55E]"}>
            {state.message}
          </p>
        ) : null}

        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#00E5FF] px-3 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!hasTheme || pending}
          type="submit"
        >
          <WandSparkles aria-hidden="true" className="h-4 w-4" />
          {pending ? "Generating..." : "Generate Draft Slides"}
        </button>
      </form>
    </section>
  );
}
