import {
  Archive,
  BarChart3,
  Box,
  Download,
  FileText,
  FolderOpen,
  Home,
  Images,
  LayoutTemplate,
  Palette,
  Plus,
  Settings,
  Sparkles,
  Upload
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type DashboardShellProps = {
  accountControl: ReactNode;
  displayName: string;
  email?: string;
  syncDetail?: string;
  syncStatus?: "active" | "needs-database" | "failed";
};

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/brands", icon: Palette, label: "Brands" },
  { href: "/projects", icon: FolderOpen, label: "Projects" },
  { href: "/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/assets", icon: Images, label: "Assets" },
  { href: "/exports", icon: Download, label: "Exports" },
  { href: "/settings", icon: Settings, label: "Settings" }
] as const;

const statCards = [
  { icon: Palette, label: "Brands", value: "0", delta: "Ready for setup" },
  { icon: FileText, label: "Projects", value: "0", delta: "Saved work will appear here" },
  { icon: Sparkles, label: "Content Ideas", value: "0", delta: "Memory powers this next" },
  { icon: Download, label: "Exports", value: "0", delta: "Exports unlock later" }
] as const;

const emptyPanels = [
  {
    icon: Box,
    label: "Recent Brands",
    text: "Brand memory will live here after the brand creation feature."
  },
  {
    icon: Archive,
    label: "Recent Projects",
    text: "Editable content projects will appear here when projects are enabled."
  },
  {
    icon: BarChart3,
    label: "Content Ideas",
    text: "Recommendations will arrive after brand memory and intelligence are wired."
  }
] as const;

const syncStatusCopy = {
  active: {
    className: "border-[#22C55E] text-[#22C55E]",
    label: "Local sync active"
  },
  failed: {
    className: "border-[#EF4444] text-[#EF4444]",
    label: "Local sync failed"
  },
  "needs-database": {
    className: "border-[#F59E0B] text-[#F59E0B]",
    label: "Local sync needs database"
  }
} as const;

export function DashboardShell({
  accountControl,
  displayName,
  email,
  syncDetail,
  syncStatus = "needs-database"
}: DashboardShellProps) {
  const syncCopy = syncStatusCopy[syncStatus];

  return (
    <main className="min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[17rem_1fr]">
        <aside className="border-b border-[#263244] bg-[#0B0F19] px-5 py-5 lg:border-b-0 lg:border-r">
          <div>
            <Link href="/dashboard" aria-label="BrandBrain dashboard">
              <Image
                alt="BrandBrain"
                src="/brandbrain-logo.png"
                width={170}
                height={113}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Primary">
            {navItems.map(({ href, icon: Icon, label }) => {
              const active = href === "/dashboard";

              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "inline-flex min-h-10 items-center gap-3 rounded-lg border px-3 py-2 text-sm transition",
                    active
                      ? "border-[#00E5FF] bg-[#00E5FF] text-[#0B0F19]"
                      : "border-transparent text-[#CBD5E1] hover:border-[#263244] hover:bg-[#141A26] hover:text-[#F8FAFC]"
                  ].join(" ")}
                  prefetch={false}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded-lg border border-[#263244] bg-[#141A26] p-4 lg:block">
            <p className="text-sm font-medium text-[#F8FAFC]">Pro Plan</p>
            <p className="mt-2 text-sm text-[#94A3B8]">0 / 50 Projects</p>
            <div className="mt-4 h-1.5 rounded-full bg-[#263244]">
              <div className="h-1.5 w-1/12 rounded-full bg-[#00E5FF]" />
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-6 py-6 lg:px-8">
          <header className="flex flex-col gap-5 border-b border-[#263244] pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#F8FAFC]">Welcome back, {displayName}</h1>
              <p className="mt-2 text-base text-[#CBD5E1]">
                Here&apos;s what&apos;s happening with your brands and content.
              </p>
              {email ? <p className="mt-1 text-sm text-[#94A3B8]">{email}</p> : null}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-3 py-1 text-sm ${syncCopy.className}`}>
                  {syncCopy.label}
                </span>
                {syncDetail ? <span className="text-sm text-[#94A3B8]">{syncDetail}</span> : null}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#263244] px-4 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
                href="/brands/import"
              >
                <Upload aria-hidden="true" className="h-4 w-4" />
                Import Brand
              </Link>
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#263244] px-4 py-2 text-sm font-semibold text-[#F8FAFC] hover:border-[#00E5FF]"
                href="/brands/new"
              >
                <Palette aria-hidden="true" className="h-4 w-4" />
                Create Brand
              </Link>
              <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#00E5FF] px-4 py-2 text-sm font-semibold text-[#0B0F19] hover:bg-[#4CF2FF]">
                <Plus aria-hidden="true" className="h-4 w-4" />
                Create Carousel
              </button>
              <div className="hidden md:block">{accountControl}</div>
            </div>
          </header>

          <section className="grid gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4" aria-label="Dashboard stats">
            {statCards.map(({ icon: Icon, label, value, delta }) => (
              <article key={label} className="rounded-lg border border-[#263244] bg-[#141A26] p-5">
                <div className="flex items-center justify-between">
                  <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-[#94A3B8]">{label}</span>
                </div>
                <p className="mt-5 text-4xl font-semibold text-[#F8FAFC]">{value}</p>
                <p className="mt-2 text-sm text-[#00E5FF]">{delta}</p>
              </article>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-3" aria-label="Dashboard workspace">
            {emptyPanels.map(({ icon: Icon, label, text }) => (
              <article key={label} className="min-h-64 rounded-lg border border-[#263244] bg-[#141A26] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg border border-[#263244] bg-[#1C2433] p-2 text-[#00E5FF]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#F8FAFC]">{label}</h2>
                </div>
                <p className="mt-5 max-w-sm text-sm leading-6 text-[#CBD5E1]">{text}</p>
              </article>
            ))}
          </section>
        </section>
      </div>
    </main>
  );
}
