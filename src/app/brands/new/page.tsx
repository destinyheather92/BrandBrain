import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { createBrandAction } from "@/features/brands/actions/create-brand.action";
import { BrandCreateForm } from "@/features/brands/components/brand-create-form";
import { initialBrandCreateFormState } from "@/features/brands/types/brand-create-form-state";

export default function NewBrandPage() {
  return (
    <main className="min-h-screen bg-[#0B0F19] px-6 py-8 text-[#F8FAFC]">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-center justify-between">
          <Link className="text-sm font-medium text-[#CBD5E1] hover:text-[#F8FAFC]" href="/dashboard">
            Back to dashboard
          </Link>
          <UserButton />
        </header>
        <BrandCreateForm action={createBrandAction} initialState={initialBrandCreateFormState} />
      </div>
    </main>
  );
}
