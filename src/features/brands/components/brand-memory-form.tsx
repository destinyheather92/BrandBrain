"use client";

import { useActionState, useState } from "react";

import type { BrandMemory } from "../types/brand-memory";
import type { BrandMemoryFormState } from "../types/brand-memory-form-state";

type BrandMemoryFormProps = {
  action: (state: BrandMemoryFormState, formData: FormData) => Promise<BrandMemoryFormState>;
  brandName: string;
  initialState: BrandMemoryFormState;
  memory: BrandMemory;
};

const fields = [
  {
    helper: "How BrandBrain should sound for this brand.",
    label: "Voice",
    name: "voice",
    placeholder: "Professional, direct, technical, warm..."
  },
  {
    helper: "Who this brand creates content for.",
    label: "Audience",
    name: "audience",
    placeholder: "Homeowners with storm damage, local business owners..."
  },
  {
    helper: "What this brand sells, supports, or promotes.",
    label: "Products and services",
    name: "productsServices",
    placeholder: "Inspections, repair, replacement, consulting..."
  },
  {
    helper: "Rules BrandBrain should respect before generating content.",
    label: "Brand rules",
    name: "brandRules",
    placeholder: "Avoid scare tactics. Keep claims practical and verifiable."
  },
  {
    helper: "Calls to action BrandBrain should prefer.",
    label: "Preferred CTAs",
    name: "preferredCtas",
    placeholder: "Schedule an inspection. Request a quote."
  },
  {
    helper: "Extra memory that should travel with this brand.",
    label: "Notes",
    name: "notes",
    placeholder: "Local proof, seasonal notes, competitive positioning..."
  }
] as const;

const colorFields = [
  {
    helper: "The main brand color used for anchors, strong sections, and visual identity.",
    label: "Primary color",
    name: "primaryColor"
  },
  {
    helper: "The action or emphasis color used for CTAs and selected highlights.",
    label: "Accent color",
    name: "accentColor"
  },
  {
    helper: "The default canvas background color for generated work.",
    label: "Background color",
    name: "backgroundColor"
  },
  {
    helper: "The preferred text color. BrandBrain will repair it if contrast is unreadable.",
    label: "Text color",
    name: "textColor"
  }
] as const;

function fieldError(errors: string[] | undefined) {
  return errors?.[0] ? <p className="mt-2 text-sm text-[#EF4444]">{errors[0]}</p> : null;
}

export function BrandMemoryForm({
  action,
  brandName,
  initialState,
  memory
}: BrandMemoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const messageClassName =
    state.status === "saved"
      ? "border-[#22C55E] text-[#22C55E]"
      : "border-[#EF4444] text-[#F8FAFC]";

  return (
    <form action={formAction} className="rounded-lg border border-[#263244] bg-[#141A26] p-6">
      <input name="brandId" type="hidden" value={memory.brandId} />

      <div>
        <p className="mb-4 inline-flex rounded-full border border-[#00E5FF] px-3 py-1 text-sm uppercase text-[#00E5FF]">
          Brand Memory
        </p>
        <h1 className="text-3xl font-semibold text-[#F8FAFC]">{brandName} memory</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#CBD5E1]">
          Store the durable brand context BrandBrain will use before future briefs, themes, projects, and generation.
        </p>
      </div>

      {state.status !== "idle" && state.message ? (
        <div className={`mt-6 rounded-lg border bg-[#0B0F19] p-4 text-sm ${messageClassName}`}>
          {state.message}
        </div>
      ) : null}

      <section className="mt-6 rounded-lg border border-[#263244] bg-[#0B0F19] p-4" aria-label="Brand color palette">
        <div>
          <h2 className="text-base font-semibold text-[#F8FAFC]">Brand color palette</h2>
          <p className="mt-1 text-sm text-[#94A3B8]">
            Add the colors this brand should use before BrandBrain generates themes or slides.
          </p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {colorFields.map(({ helper, label, name }) => (
            <PaletteColorField
              error={state.fieldErrors[name]?.[0]}
              helper={helper}
              key={name}
              label={label}
              name={name}
              value={memory[name]}
            />
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-5">
        {fields.map(({ helper, label, name, placeholder }) => (
          <div className="block" key={name}>
            <label className="text-sm font-medium text-[#F8FAFC]" htmlFor={`brand-memory-${name}`}>
              {label}
            </label>
            <p className="mt-1 text-sm text-[#94A3B8]">{helper}</p>
            <textarea
              className="mt-2 min-h-24 w-full resize-y rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
              defaultValue={memory[name] ?? ""}
              id={`brand-memory-${name}`}
              name={name}
              placeholder={placeholder}
            />
            {fieldError(state.fieldErrors[name])}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          className="inline-flex min-h-11 items-center rounded-lg bg-[#00E5FF] px-5 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving..." : "Save Memory"}
        </button>
        <a className="text-sm font-medium text-[#CBD5E1] hover:text-[#F8FAFC]" href="/brands">
          View brands
        </a>
      </div>
    </form>
  );
}

function PaletteColorField({
  error,
  helper,
  label,
  name,
  value
}: {
  error?: string;
  helper: string;
  label: string;
  name: (typeof colorFields)[number]["name"];
  value: string | null;
}) {
  const [color, setColor] = useState(value ?? "");
  const swatchColor = /^#[0-9A-Fa-f]{6}$/.test(color) ? color : "#0B0F19";

  return (
    <label className="block">
      <span className="text-sm font-medium text-[#F8FAFC]">{label}</span>
      <span className="mt-1 block text-sm text-[#94A3B8]">{helper}</span>
      <span className="mt-2 flex min-h-11 items-center gap-2 rounded-lg border border-[#263244] bg-[#141A26] p-2 focus-within:border-[#00E5FF]">
        <input
          aria-label={`${label} swatch`}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[#263244] bg-transparent"
          onChange={(event) => setColor(event.target.value.toUpperCase())}
          type="color"
          value={swatchColor}
        />
        <input
          aria-label={label}
          className="min-w-0 flex-1 bg-transparent text-sm text-[#F8FAFC] outline-none"
          name={name}
          onChange={(event) => setColor(event.target.value.toUpperCase())}
          placeholder="#315B2C"
          type="text"
          value={color}
        />
      </span>
      {error ? <p className="mt-2 text-sm text-[#EF4444]">{error}</p> : null}
    </label>
  );
}
