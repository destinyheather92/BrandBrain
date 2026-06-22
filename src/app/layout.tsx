import type { Metadata } from "next";
import type { ReactNode } from "react";

import { appThemeStorageKey } from "@/features/app-theme/app-theme.constants";
import { AppThemeProvider } from "@/features/app-theme/components/app-theme-provider";
import { isClerkConfigured } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  title: "BrandBrain",
  description: "AI-powered creative operating system for brand-consistent content."
};

type RootLayoutProps = {
  children: ReactNode;
};

const themeInitScript = `
(() => {
  try {
    const storedMode = window.localStorage.getItem("${appThemeStorageKey}");
    const mode = storedMode === "light" ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.theme = mode;
    root.classList.toggle("bb-theme-light", mode === "light");
    root.classList.toggle("bb-theme-dark", mode === "dark");
    root.style.colorScheme = mode;
  } catch {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.classList.add("bb-theme-dark");
  }
})();
`;

export default async function RootLayout({ children }: RootLayoutProps) {
  let content = children;

  if (isClerkConfigured()) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    content = <ClerkProvider>{children}</ClerkProvider>;
  }

  return (
    <html className="bb-theme-dark" data-theme="dark" lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AppThemeProvider>{content}</AppThemeProvider>
      </body>
    </html>
  );
}
