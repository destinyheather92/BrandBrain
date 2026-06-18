import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { importBrandFromWebsiteAction } from "@/features/brands/actions/import-brand-from-website.action";
import { WebsiteImportForm } from "@/features/brands/components/website-import-form";
import { initialWebsiteImportFormState } from "@/features/brands/types/website-import-form-state";

export default function ImportBrandPage() {
  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <Link className="text-sm font-medium text-[#CBD5E1] hover:text-[#F8FAFC]" href="/dashboard">
              Back to dashboard
            </Link>
            <Link className="text-sm font-medium text-[#CBD5E1] hover:text-[#F8FAFC]" href="/brands">
              View brands
            </Link>
          </div>
          <UserButton />
        </header>
        <WebsiteImportForm action={importBrandFromWebsiteAction} initialState={initialWebsiteImportFormState} />
      </div>
    </main>
  );
}
