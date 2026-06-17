import Image from "next/image";
import Link from "next/link";

import { getAuthRouteConfig } from "@/features/auth/services/auth-route.service";

export default function HomePage() {
  const routes = getAuthRouteConfig();

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <Image
            alt="BrandBrain"
            src="/brandbrain-logo.png"
            width={216}
            height={144}
            priority
            className="h-16 w-auto object-contain"
          />
          <div className="flex items-center gap-3">
            <Link className="text-sm text-[#CBD5E1] hover:text-[#F8FAFC]" href={routes.signIn}>
              Sign in
            </Link>
            <Link
              className="rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]"
              href={routes.signUp}
            >
              Get started
            </Link>
          </div>
        </nav>

        <div className="flex flex-1 items-center">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-[#00E5FF] px-3 py-1 text-sm uppercase tracking-normal text-[#00E5FF]">
              AI-powered creative operating system
            </p>
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
              Remember your brand. Create content that{" "}
              <span className="text-[#00E5FF]">connects.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#CBD5E1]">
              Start with a secure BrandBrain identity. Brand memory, projects, and editor history
              will attach to the authenticated user as the product grows.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="rounded-lg bg-[#00E5FF] px-5 py-3 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]"
                href={routes.signUp}
              >
                Create account
              </Link>
              <Link
                className="rounded-lg border border-[#263244] px-5 py-3 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
                href={routes.signIn}
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
