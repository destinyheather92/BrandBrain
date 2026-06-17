import type { Metadata } from "next";
import type { ReactNode } from "react";

import { isClerkConfigured } from "@/lib/env";

import "./globals.css";

export const metadata: Metadata = {
  title: "BrandBrain",
  description: "AI-powered creative operating system for brand-consistent content."
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  let content = children;

  if (isClerkConfigured()) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    content = <ClerkProvider>{children}</ClerkProvider>;
  }

  return (
    <html lang="en">
      <body>{content}</body>
    </html>
  );
}
