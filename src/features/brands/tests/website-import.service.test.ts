import { describe, expect, it, vi } from "vitest";

import {
  extractWebsiteBrandProfile,
  importBrandFromWebsite
} from "../services/website-import.service";
import type { Brand, BrandRepository } from "../types/brand";
import type { WebsiteImportFetcher } from "../types/website-import";

const importedBrand: Brand = {
  createdAt: new Date("2026-06-18T12:00:00.000Z"),
  description: "Storm damage repair and roof replacement for homeowners.",
  id: "brand_imported_123",
  industry: null,
  name: "ABC Roofing",
  ownerUserId: "user_local_123",
  updatedAt: new Date("2026-06-18T12:00:00.000Z"),
  websiteUrl: "https://abcroofing.com/"
};

function createRepository(): BrandRepository {
  return {
    create: vi.fn().mockResolvedValue(importedBrand),
    findByIdForOwner: vi.fn(),
    listByOwnerUserId: vi.fn()
  };
}

describe("extractWebsiteBrandProfile", () => {
  it("prefers site metadata for the brand name and description", () => {
    const profile = extractWebsiteBrandProfile(`
      <html>
        <head>
          <title>Home | ABC Roofing</title>
          <meta property="og:site_name" content="ABC Roofing" />
          <meta name="description" content="Storm damage repair and roof replacement for homeowners." />
        </head>
      </html>
    `);

    expect(profile).toEqual({
      description: "Storm damage repair and roof replacement for homeowners.",
      name: "ABC Roofing"
    });
  });

  it("falls back to a cleaned title when site metadata is missing", () => {
    const profile = extractWebsiteBrandProfile(`
      <html>
        <head>
          <title>Summit Solar - Clean Energy for Arizona</title>
        </head>
      </html>
    `);

    expect(profile).toEqual({
      description: null,
      name: "Summit Solar"
    });
  });

  it("adds detected website palette colors to the imported brand profile", () => {
    const profile = extractWebsiteBrandProfile(`
      <html>
        <head>
          <meta property="og:site_name" content="Land Strong" />
          <meta name="description" content="Premium land clearing, grading, and drainage." />
          <style>
            :root {
              --brand-green: #315B2C;
              --brand-gold: #C49A3A;
              --brandbrain-cyan: #00E5FF;
            }
            .hero { background: #F7F3E8; color: #315B2C; }
          </style>
        </head>
      </html>
    `);

    expect(profile).toEqual({
      description:
        "Premium land clearing, grading, and drainage. Detected website colors: #315B2C, #C49A3A, #F7F3E8.",
      name: "Land Strong"
    });
  });
});

describe("importBrandFromWebsite", () => {
  it("normalizes the website URL, fetches metadata, and creates a brand", async () => {
    const repository = createRepository();
    const fetcher: WebsiteImportFetcher = vi.fn().mockResolvedValue({
      finalUrl: "https://abcroofing.com/",
      html: `
        <html>
          <head>
            <meta property="og:site_name" content="ABC Roofing" />
            <meta property="og:description" content="Storm damage repair and roof replacement for homeowners." />
          </head>
        </html>
      `,
      ok: true
    });

    const result = await importBrandFromWebsite({
      fetcher,
      input: {
        websiteUrl: "abcroofing.com"
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(fetcher).toHaveBeenCalledWith("https://abcroofing.com/");
    expect(repository.create).toHaveBeenCalledWith({
      description: "Storm damage repair and roof replacement for homeowners.",
      industry: null,
      name: "ABC Roofing",
      ownerUserId: "user_local_123",
      websiteUrl: "https://abcroofing.com/"
    });
    expect(result).toEqual({
      brand: importedBrand,
      ok: true,
      status: "imported"
    });
  });

  it("passes detected website palette hints into the created brand description", async () => {
    const repository = createRepository();
    const fetcher: WebsiteImportFetcher = vi.fn().mockResolvedValue({
      finalUrl: "https://landstrong.example/",
      html: `
        <html>
          <head>
            <meta property="og:site_name" content="Land Strong" />
            <meta property="og:description" content="Premium land management for rural properties." />
            <style>
              :root { --green: #315B2C; --gold: #C49A3A; }
            </style>
          </head>
        </html>
      `,
      ok: true
    });

    await importBrandFromWebsite({
      fetcher,
      input: {
        websiteUrl: "landstrong.example"
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        description:
          "Premium land management for rural properties. Detected website colors: #315B2C, #C49A3A.",
        name: "Land Strong"
      })
    );
  });

  it("returns a typed validation failure for invalid URLs", async () => {
    const repository = createRepository();
    const fetcher: WebsiteImportFetcher = vi.fn();

    const result = await importBrandFromWebsite({
      fetcher,
      input: {
        websiteUrl: "not a website"
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      error: {
        code: "invalid_website_url",
        fieldErrors: {
          websiteUrl: ["Enter a valid website URL."]
        }
      },
      status: "failed"
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("returns a typed fetch failure when the website cannot be imported", async () => {
    const repository = createRepository();
    const fetcher: WebsiteImportFetcher = vi.fn().mockResolvedValue({
      message: "The website returned a non-HTML response.",
      ok: false,
      status: "non_html_response"
    });

    const result = await importBrandFromWebsite({
      fetcher,
      input: {
        websiteUrl: "https://abcroofing.com"
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(result).toEqual({
      error: {
        code: "website_fetch_failed",
        fieldErrors: {
          websiteUrl: ["The website returned a non-HTML response."]
        },
        message: "The website returned a non-HTML response."
      },
      ok: false,
      status: "failed"
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("returns a typed metadata failure when no brand name can be found", async () => {
    const repository = createRepository();
    const fetcher: WebsiteImportFetcher = vi.fn().mockResolvedValue({
      finalUrl: "https://blank.example/",
      html: "<html><head></head><body>No metadata here.</body></html>",
      ok: true
    });

    const result = await importBrandFromWebsite({
      fetcher,
      input: {
        websiteUrl: "https://blank.example"
      },
      ownerUserId: "user_local_123",
      repository
    });

    expect(result).toEqual({
      error: {
        code: "website_metadata_missing",
        fieldErrors: {
          websiteUrl: ["BrandBrain could not find a brand name on this website."]
        },
        message: "BrandBrain could not find a brand name on this website."
      },
      ok: false,
      status: "failed"
    });
    expect(repository.create).not.toHaveBeenCalled();
  });
});
