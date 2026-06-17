import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { getAuthRouteConfig } from "../services/auth-route.service";
import type { AuthMode } from "../types/auth-route";

type BrandBrainAuthShellProps = {
  children: ReactNode;
  mode: AuthMode;
};

const copyByMode = {
  "sign-in": {
    eyebrow: "AI-powered creative operating system",
    heading: "Welcome back",
    subheading: "Sign in to your BrandBrain account",
    switchCopy: "Need an account?",
    switchHref: getAuthRouteConfig().signUp,
    switchLabel: "Create one"
  },
  "sign-up": {
    eyebrow: "Build with brand memory",
    heading: "Create your account",
    subheading: "Start building your brand and content system",
    switchCopy: "Already have an account?",
    switchHref: getAuthRouteConfig().signIn,
    switchLabel: "Sign in"
  }
} as const;

const valueProps = [
  "Remember every brand",
  "Generate consistent content",
  "Save editable projects"
];

export function BrandBrainAuthShell({ children, mode }: BrandBrainAuthShellProps) {
  const copy = copyByMode[mode];

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex min-h-[42rem] flex-col justify-between border-b border-[#263244] px-6 py-8 lg:border-b-0 lg:border-r lg:px-10">
          <Link className="inline-flex w-fit items-center" href="/" aria-label="BrandBrain home">
            <Image
              alt=""
              src="/brandbrain-logo.png"
              width={216}
              height={144}
              priority
              className="h-16 w-auto object-contain"
            />
          </Link>

          <div className="max-w-2xl">
            <p className="mb-5 inline-flex rounded-full border border-[#00E5FF] px-3 py-1 text-sm uppercase tracking-normal text-[#00E5FF]">
              {copy.eyebrow}
            </p>
            <h1 className="text-5xl font-bold leading-tight text-[#F8FAFC] sm:text-6xl">
              Remember your brand. Create content that{" "}
              <span className="text-[#00E5FF]">connects.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#CBD5E1]">
              BrandBrain keeps authentication at the front door so brand memory, projects,
              and future editor work always belong to the right user.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {valueProps.map((item) => (
              <div key={item} className="rounded-lg border border-[#263244] bg-[#141A26] p-4">
                <div className="mb-3 h-2 w-8 rounded-full bg-[#00E5FF]" />
                <p className="text-sm text-[#CBD5E1]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <div className="mb-5 flex justify-center">
                <Image
                  alt="BrandBrain"
                  src="/brandbrain-logo.png"
                  width={180}
                  height={120}
                  className="h-14 w-auto object-contain"
                />
              </div>
              <h2 className="text-3xl font-semibold text-[#F8FAFC]">{copy.heading}</h2>
              <p className="mt-2 text-base text-[#CBD5E1]">{copy.subheading}</p>
            </div>

            {children}

            <p className="mt-6 text-center text-sm text-[#CBD5E1]">
              {copy.switchCopy}{" "}
              <Link className="font-medium text-[#00E5FF] hover:text-[#4CF2FF]" href={copy.switchHref}>
                {copy.switchLabel}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
