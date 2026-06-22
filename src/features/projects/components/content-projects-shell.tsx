"use client";

import { FileJson, FolderOpen, Plus, SquareDashedMousePointer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import type { Brand } from "@/features/brands/types/brand";

import type { ContentProject } from "../types/content-project";
import type { ContentProjectFormState } from "../types/content-project-form-state";

type ContentProjectsShellProps = {
  action: (state: ContentProjectFormState, formData: FormData) => Promise<ContentProjectFormState>;
  brands: Brand[];
  deleteAction?: (formData: FormData) => Promise<void>;
  initialState: ContentProjectFormState;
  message?: string;
  messageTone?: "error" | "success";
  projects: ContentProject[];
};

function fieldError(errors: string[] | undefined) {
  return errors?.[0] ? <p className="mt-2 text-sm text-[#EF4444]">{errors[0]}</p> : null;
}

const fallbackDeleteAction = async () => {};

export function ContentProjectsShell({
  action,
  brands,
  deleteAction = fallbackDeleteAction,
  initialState,
  message,
  messageTone = "success",
  projects
}: ContentProjectsShellProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const hasBrands = brands.length > 0;
  const messageClassName =
    messageTone === "error"
      ? "border-[#EF4444] text-[#F8FAFC]"
      : "border-[#22C55E] text-[#22C55E]";

  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-[#263244] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#00E5FF] px-3 py-1 text-sm uppercase text-[#00E5FF]">
              Editable Project System
            </p>
            <h1 className="text-3xl font-semibold">Projects</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-[#CBD5E1]">
              Saved content projects keep the canvas JSON source, brand link, and project state together.
            </p>
          </div>

          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#263244] px-4 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
            href="/canvas"
          >
            <SquareDashedMousePointer aria-hidden="true" className="h-4 w-4" />
            Canvas Model
          </Link>
        </header>

        {message ? (
          <div className={`mt-6 rounded-lg border bg-[#141A26] p-4 text-sm ${messageClassName}`}>
            {message}
          </div>
        ) : null}

        {state.status === "error" && state.message ? (
          <div className="mt-6 rounded-lg border border-[#EF4444] bg-[#141A26] p-4 text-sm text-[#F8FAFC]">
            {state.message}
          </div>
        ) : null}

        <section className="mt-6 grid gap-5 lg:grid-cols-[22rem_1fr]" aria-label="Content project workspace">
          <form action={formAction} className="rounded-lg border border-[#263244] bg-[#141A26] p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
                <Plus aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">New starter project</h2>
            </div>

            {hasBrands ? (
              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-[#F8FAFC]">Project title</span>
                  <input
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
                    name="title"
                    placeholder="Storm Damage Carousel"
                  />
                  {fieldError(state.fieldErrors.title)}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#F8FAFC]">Brand</span>
                  <select
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

                <label className="block">
                  <span className="text-sm font-medium text-[#F8FAFC]">Content type</span>
                  <select
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
                    defaultValue="instagram-carousel"
                    name="format"
                  >
                    <option value="instagram-carousel">Instagram carousel</option>
                    <option value="square-post">Square post</option>
                    <option value="story">Story</option>
                    <option value="presentation">Presentation</option>
                  </select>
                  {fieldError(state.fieldErrors.format)}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-[#F8FAFC]">Slides</span>
                  <input
                    className="mt-2 min-h-11 w-full rounded-lg border border-[#263244] bg-[#0B0F19] px-3 py-2 text-[#F8FAFC] outline-none focus:border-[#00E5FF]"
                    defaultValue={5}
                    max={10}
                    min={1}
                    name="slideCount"
                    type="number"
                  />
                  {fieldError(state.fieldErrors.slideCount)}
                </label>

                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#00E5FF] px-5 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={pending}
                  type="submit"
                >
                  {pending ? "Creating..." : "Create Starter Project"}
                </button>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-[#263244] bg-[#0B0F19] p-4">
                <p className="text-sm leading-6 text-[#CBD5E1]">
                  Create or import a brand before starting a project.
                </p>
                <Link
                  className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]"
                  href="/brands/new"
                >
                  Create Brand
                </Link>
              </div>
            )}
          </form>

          <section className="rounded-lg border border-[#263244] bg-[#141A26] p-5" aria-label="Saved projects">
            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
                <FolderOpen aria-hidden="true" className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Saved projects</h2>
            </div>

            {projects.length > 0 ? (
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {projects.map((project) => (
                  <article key={project.id} className="rounded-lg border border-[#263244] bg-[#0B0F19] p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[#F8FAFC]">{project.title}</h3>
                        <p className="mt-2 text-sm text-[#00E5FF]">{project.brandName}</p>
                      </div>
                      <span className="rounded-full border border-[#263244] px-3 py-1 text-xs uppercase text-[#94A3B8]">
                        {project.status}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-lg border border-[#263244] bg-[#141A26] p-3">
                        <p className="text-[#94A3B8]">Canvas JSON source</p>
                        <p className="mt-1 font-medium text-[#F8FAFC]">{project.canvasJson.schemaVersion}</p>
                      </div>
                      <div className="rounded-lg border border-[#263244] bg-[#141A26] p-3">
                        <p className="text-[#94A3B8]">Slides</p>
                        <p className="mt-1 font-medium text-[#F8FAFC]">
                          {project.canvasJson.slides.length} editable slides
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-sm text-[#94A3B8]">
                      <FileJson aria-hidden="true" className="h-4 w-4 text-[#00E5FF]" />
                      <span>{project.format}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]"
                        href={`/projects/${project.id}/editor`}
                      >
                        Open Editor
                      </Link>
                      <form
                        action={deleteAction}
                        onSubmit={(event) => {
                          const confirmed = window.confirm(
                            `Delete "${project.title}"? This cannot be undone.`
                          );

                          if (!confirmed) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <input name="projectId" type="hidden" value={project.id} />
                        <button
                          aria-label={`Delete ${project.title}`}
                          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#EF4444] px-4 py-2 text-sm font-semibold text-[#EF4444] hover:bg-[#1C2433]"
                          type="submit"
                        >
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-[#263244] bg-[#0B0F19] p-6">
                <h3 className="text-lg font-semibold text-[#F8FAFC]">No projects yet</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#CBD5E1]">
                  Create a starter project to save editable slide JSON under one of your brands.
                </p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
