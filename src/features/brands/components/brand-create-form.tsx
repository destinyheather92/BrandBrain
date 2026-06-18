"use client";

import { useActionState } from "react";

import type { BrandCreateFormState } from "../types/brand-create-form-state";

type BrandCreateFormProps = {
  action: (state: BrandCreateFormState, formData: FormData) => Promise<BrandCreateFormState>;
  initialState: BrandCreateFormState;
};

function fieldError(errors: string[] | undefined) {
  return errors?.[0] ? <p className="mt-2 text-sm text-[#EF4444]">{errors[0]}</p> : null;
}

export function BrandCreateForm({ action, initialState }: BrandCreateFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-[#263244] bg-[#141A26] p-6">
      <div>
        <p className="mb-4 inline-flex rounded-full border border-[#00E5FF] px-3 py-1 text-sm uppercase text-[#00E5FF]">
          Brand Memory Starts Here
        </p>
        <h1 className="text-3xl font-semibold text-[#F8FAFC]">Create a brand</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#CBD5E1]">
          Save the brand foundation that future imports, memory, projects, and generation will use.
        </p>
      </div>

      {state.status === "error" && state.message ? (
        <div className="mt-6 rounded-lg border border-[#EF4444] bg-[#0B0F19] p-4 text-sm text-[#F8FAFC]">
          {state.message}
        </div>
      ) : null}

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="text-sm font-medium text-[#F8FAFC]">Brand name</span>
          <input
            className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
            name="name"
            placeholder="ABC Roofing"
          />
          {fieldError(state.fieldErrors.name)}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#F8FAFC]">Website URL</span>
          <input
            className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
            name="websiteUrl"
            placeholder="https://example.com"
            type="url"
          />
          {fieldError(state.fieldErrors.websiteUrl)}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#F8FAFC]">Industry</span>
          <input
            className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
            name="industry"
            placeholder="Roofing, SaaS, Fitness, Legal"
          />
          {fieldError(state.fieldErrors.industry)}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-[#F8FAFC]">Brand description</span>
          <textarea
            className="mt-2 min-h-28 w-full resize-y rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
            name="description"
            placeholder="What does this brand do, who does it serve, and what should BrandBrain remember first?"
          />
          {fieldError(state.fieldErrors.description)}
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-11 items-center rounded-lg bg-[#00E5FF] px-5 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Creating..." : "Create Brand"}
        </button>
        <a className="text-sm font-medium text-[#CBD5E1] hover:text-[#F8FAFC]" href="/brands">
          View brands
        </a>
      </div>
    </form>
  );
}
