import { Plus, Upload } from "lucide-react";
import Link from "next/link";

import type { Brand } from "../types/brand";

type BrandsListShellProps = {
  brands: Brand[];
  message?: string;
};

export function BrandsListShell({ brands, message }: BrandsListShellProps) {
  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-[#263244] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#00E5FF] px-3 py-1 text-sm uppercase text-[#00E5FF]">
              Brand System
            </p>
            <h1 className="text-3xl font-semibold">Brands</h1>
            <p className="mt-2 text-base text-[#CBD5E1]">
              Every content workflow starts with a brand.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#263244] px-4 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
              href="/brands/import"
            >
              <Upload aria-hidden="true" className="h-4 w-4" />
              Import Website
            </Link>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]"
              href="/brands/new"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Create Brand
            </Link>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-lg border border-[#22C55E] bg-[#141A26] p-4 text-sm text-[#22C55E]">
            {message}
          </div>
        ) : null}

        {brands.length > 0 ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Created brands">
            {brands.map((brand) => (
              <article key={brand.id} className="rounded-lg border border-[#263244] bg-[#141A26] p-5">
                <h2 className="text-xl font-semibold text-[#F8FAFC]">{brand.name}</h2>
                {brand.industry ? <p className="mt-2 text-sm text-[#00E5FF]">{brand.industry}</p> : null}
                {brand.websiteUrl ? (
                  <p className="mt-3 truncate text-sm text-[#CBD5E1]">{brand.websiteUrl}</p>
                ) : null}
                {brand.description ? (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-[#CBD5E1]">{brand.description}</p>
                ) : null}
              </article>
            ))}
          </section>
        ) : (
          <section className="mt-6 rounded-lg border border-[#263244] bg-[#141A26] p-8">
            <h2 className="text-2xl font-semibold text-[#F8FAFC]">No brands yet</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#CBD5E1]">
              Create your first brand or import one from a public website so BrandBrain has a persistent identity to remember.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
