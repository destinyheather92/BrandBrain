"use client";

import { Layers3, LayoutTemplate, Palette, Plus } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import type { CanvasElement, CanvasSlide } from "@/features/canvas/types/canvas";
import type { ContentProjectFormState } from "@/features/projects/types/content-project-form-state";

import type { ContentTemplate, TemplatesShellBrand } from "../types/template";

type TemplatesShellProps = {
  action: (state: ContentProjectFormState, formData: FormData) => Promise<ContentProjectFormState>;
  brands: TemplatesShellBrand[];
  initialState: ContentProjectFormState;
  message?: string;
  templates: ContentTemplate[];
};

function fieldError(errors: string[] | undefined) {
  return errors?.[0] ? <p className="mt-2 text-sm text-[#EF4444]">{errors[0]}</p> : null;
}

export function TemplatesShell({
  action,
  brands,
  initialState,
  message,
  templates
}: TemplatesShellProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const hasBrands = brands.length > 0;

  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#263244] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#00E5FF] px-3 py-1 text-sm uppercase text-[#00E5FF]">
              Template Library
            </p>
            <h1 className="text-3xl font-semibold">Templates</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#CBD5E1]">
              Reusable BrandBrain structures for editable content projects.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#263244] px-4 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
              href="/projects"
            >
              <Layers3 aria-hidden="true" className="h-4 w-4" />
              Projects
            </Link>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]"
              href="/brands/new"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Create Brand
            </Link>
          </div>
        </header>

        {message ? (
          <div className="mt-6 rounded-lg border border-[#22C55E] bg-[#141A26] p-4 text-sm text-[#22C55E]">
            {message}
          </div>
        ) : null}

        {state.status === "error" && state.message ? (
          <div className="mt-6 rounded-lg border border-[#EF4444] bg-[#141A26] p-4 text-sm text-[#F8FAFC]">
            {state.message}
          </div>
        ) : null}

        <section className="mt-6 grid gap-5 lg:grid-cols-2" aria-label="Template library">
          {templates.map((template) => (
            <article key={template.id} className="rounded-lg border border-[#263244] bg-[#141A26] p-5">
              <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
                <TemplatePreview template={template} />

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="inline-flex rounded-full border border-[#263244] px-3 py-1 text-xs uppercase text-[#00E5FF]">
                        {template.category}
                      </p>
                      <h2 className="mt-3 text-2xl font-semibold text-[#F8FAFC]">{template.name}</h2>
                    </div>
                    <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
                      <LayoutTemplate aria-hidden="true" className="h-5 w-5" />
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#CBD5E1]">{template.description}</p>
                  <p className="mt-3 text-sm leading-6 text-[#94A3B8]">{template.recommendedUse}</p>

                  {hasBrands ? (
                    <form action={formAction} className="mt-5 grid gap-4">
                      <input name="templateId" type="hidden" value={template.id} />

                      <label className="block">
                        <span className="text-sm font-medium text-[#F8FAFC]">
                          Project title for {template.name}
                        </span>
                        <input
                          aria-label={`Project title for ${template.name}`}
                          className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
                          defaultValue={template.name}
                          name="title"
                        />
                        {fieldError(state.fieldErrors.title)}
                      </label>

                      <label className="block">
                        <span className="text-sm font-medium text-[#F8FAFC]">
                          Brand for {template.name}
                        </span>
                        <select
                          aria-label={`Brand for ${template.name}`}
                          className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
                          defaultValue={brands[0]?.id}
                          name="brandId"
                        >
                          {brands.map((brand) => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                        {fieldError(state.fieldErrors.brandId)}
                      </label>

                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#00E5FF] px-5 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={pending}
                        type="submit"
                      >
                        <Palette aria-hidden="true" className="h-4 w-4" />
                        {pending ? "Creating..." : `Use ${template.name}`}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-5 rounded-lg border border-[#263244] bg-[#0B0F19] p-4">
                      <p className="text-sm leading-6 text-[#CBD5E1]">
                        Create a brand before using templates.
                      </p>
                      <Link
                        className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]"
                        href="/brands/new"
                      >
                        Create Brand
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function TemplatePreview({ template }: { template: ContentTemplate }) {
  const slide = template.canvasJson.slides[0];

  return (
    <div
      aria-label={`${template.name} template preview`}
      className="relative aspect-square overflow-hidden rounded-lg border border-[#263244] bg-[#0B0F19]"
      style={{
        backgroundColor: slide?.background.color ?? "#FFFFFF"
      }}
    >
      {slide?.elements.map((element) => (
        <PreviewElement element={element} key={element.id} slide={slide} />
      ))}
    </div>
  );
}

function PreviewElement({ element, slide }: { element: CanvasElement; slide: CanvasSlide }) {
  const baseStyle = {
    height: `${(element.height / slide.height) * 100}%`,
    left: `${(element.x / slide.width) * 100}%`,
    opacity: element.opacity,
    top: `${(element.y / slide.height) * 100}%`,
    transform: `rotate(${element.rotation}deg)`,
    width: `${(element.width / slide.width) * 100}%`,
    zIndex: element.zIndex
  };

  if (element.type === "shape") {
    return (
      <div
        className="absolute"
        style={{
          ...baseStyle,
          backgroundColor: element.fill,
          borderRadius: element.borderRadius / 6
        }}
      />
    );
  }

  if (element.type === "cta") {
    return (
      <div
        className="absolute flex items-center justify-center overflow-hidden px-2 text-center font-semibold leading-tight"
        style={{
          ...baseStyle,
          backgroundColor: element.backgroundColor,
          borderRadius: element.borderRadius / 6,
          color: element.textColor,
          fontSize: `${Math.max(8, element.fontSize / 5)}px`
        }}
      >
        {element.label}
      </div>
    );
  }

  if (element.type === "text") {
    return (
      <div
        className="absolute overflow-hidden text-left font-semibold leading-tight"
        style={{
          ...baseStyle,
          color: element.color,
          fontSize: `${Math.max(8, element.fontSize / 5)}px`,
          fontWeight: element.fontWeight === "regular" ? 400 : 700,
          textAlign: element.textAlign
        }}
      >
        {element.content}
      </div>
    );
  }

  return null;
}
