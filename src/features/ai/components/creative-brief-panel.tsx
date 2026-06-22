"use client";

import { ClipboardList, Sparkles } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import type { CreativeBrief } from "../types/creative-brief";
import type { CreativeBriefAction, CreativeBriefActionState } from "../types/creative-brief-action-state";

type CreativeBriefPanelProps = {
  briefAction: CreativeBriefAction;
  initialState: CreativeBriefActionState;
  onGenerated: (brief: CreativeBrief) => void;
  projectId: string;
};

const briefFields = [
  {
    key: "goal",
    label: "Goal"
  },
  {
    key: "audience",
    label: "Audience"
  },
  {
    key: "angle",
    label: "Angle"
  },
  {
    key: "hook",
    label: "Hook"
  },
  {
    key: "cta",
    label: "CTA"
  }
] satisfies Array<{
  key: keyof CreativeBrief;
  label: string;
}>;

export function CreativeBriefPanel({
  briefAction,
  initialState,
  onGenerated,
  projectId
}: CreativeBriefPanelProps) {
  const [state, formAction, pending] = useActionState(briefAction, initialState);
  const brief = state.brief;
  const lastAppliedBriefRef = useRef<CreativeBrief | null>(null);

  useEffect(() => {
    if (!brief || lastAppliedBriefRef.current === brief) {
      return;
    }

    lastAppliedBriefRef.current = brief;
    onGenerated(brief);
  }, [brief, onGenerated]);

  return (
    <section className="rounded-lg border border-[#263244] bg-[#0B0F19] p-4" aria-label="Creative Brief">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F8FAFC]">
            <ClipboardList aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
            <h2>Creative Brief</h2>
          </div>
          <p className="mt-1 text-xs uppercase text-[#94A3B8]">Strategy before slides</p>
        </div>
        <Sparkles aria-hidden="true" className="h-5 w-5 text-[#CBD5E1]" />
      </div>

      <form action={formAction} className="mt-4 grid gap-3">
        <input name="projectId" type="hidden" value={projectId} />
        <label className="text-sm text-[#CBD5E1]" htmlFor="creative-brief-request">
          Idea
        </label>
        <textarea
          className="min-h-24 resize-y rounded-lg border border-[#263244] bg-[#141A26] px-3 py-2 text-sm text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
          defaultValue="Create a carousel from this idea."
          id="creative-brief-request"
          maxLength={3000}
          name="userRequest"
          readOnly={pending}
        />

        {state.message ? (
          <p className={state.status === "error" ? "text-sm text-[#EF4444]" : "text-sm text-[#22C55E]"}>
            {state.message}
          </p>
        ) : null}

        <button
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#00E5FF] px-3 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {pending ? "Building..." : "Build Brief"}
        </button>
      </form>

      {brief ? (
        <dl className="mt-4 grid gap-2">
          {briefFields.map((field) => (
            <div className="rounded-lg border border-[#263244] bg-[#141A26] p-3" key={field.key}>
              <dt className="text-xs font-semibold uppercase text-[#94A3B8]">{field.label}</dt>
              <dd className="mt-1 text-sm leading-6 text-[#F8FAFC]">{brief[field.key]}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
