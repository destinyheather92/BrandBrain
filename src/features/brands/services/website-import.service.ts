import { websiteImportInputSchema } from "../schemas/website-import.schema";
import { createBrandForUser } from "./brand.service";
import type { BrandRepository } from "../types/brand";
import type {
  WebsiteBrandProfile,
  WebsiteImportFetcher,
  WebsiteImportInput,
  WebsiteImportResult
} from "../types/website-import";

type ImportBrandFromWebsiteParams = {
  fetcher: WebsiteImportFetcher;
  input: WebsiteImportInput;
  ownerUserId: string;
  repository: BrandRepository;
};

function decodeBasicHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function normalizeText(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = decodeBasicHtmlEntities(stripTags(value))
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getAttribute(tag: string, name: string) {
  const pattern = new RegExp(
    `${escapeRegExp(name)}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    "i"
  );
  const match = tag.match(pattern);

  return normalizeText(match?.[1] ?? match?.[2] ?? match?.[3]);
}

function getMetaContent(html: string, keys: string[]) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const normalizedKeys = keys.map((key) => key.toLowerCase());

  for (const tag of metaTags) {
    const identifier = getAttribute(tag, "property") ?? getAttribute(tag, "name");

    if (identifier && normalizedKeys.includes(identifier.toLowerCase())) {
      return getAttribute(tag, "content");
    }
  }

  return null;
}

function getTitle(html: string) {
  const match = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);

  return normalizeText(match?.[1]);
}

function cleanTitleForBrandName(title: string | null) {
  if (!title) {
    return null;
  }

  const separators = [" | ", " - ", " – ", " — "];

  for (const separator of separators) {
    if (title.includes(separator)) {
      return normalizeText(title.split(separator)[0]);
    }
  }

  return normalizeText(title);
}

function normalizeImportedUrl(url: string, fallbackUrl: string) {
  const parsed = websiteImportInputSchema.safeParse({ websiteUrl: url });

  return parsed.success ? parsed.data.websiteUrl : fallbackUrl;
}

export function extractWebsiteBrandProfile(html: string): WebsiteBrandProfile {
  const name =
    getMetaContent(html, ["og:site_name", "application-name", "apple-mobile-web-app-title"]) ??
    cleanTitleForBrandName(getMetaContent(html, ["og:title", "twitter:title"]) ?? getTitle(html));
  const description = getMetaContent(html, ["description", "og:description", "twitter:description"]);
  const palette = extractWebsitePaletteColors(html, name);

  return {
    description: appendPaletteHints(description, palette),
    name
  };
}

function appendPaletteHints(description: string | null, palette: string[]) {
  if (palette.length === 0) {
    return description;
  }

  const paletteSentence = `Detected website colors: ${palette.join(", ")}.`;

  return description ? `${description} ${paletteSentence}` : paletteSentence;
}

function extractWebsitePaletteColors(html: string, brandName: string | null): string[] {
  const colors = html.match(/#[0-9A-Fa-f]{6}\b/g) ?? [];
  const allowBrandBrainColors = /\bbrandbrain\b/i.test(brandName ?? "");

  return colors.reduce<string[]>((palette, color) => {
    const normalized = color.toUpperCase();

    if (!allowBrandBrainColors && brandBrainPaletteColors.has(normalized)) {
      return palette;
    }

    if (!palette.includes(normalized)) {
      palette.push(normalized);
    }

    return palette;
  }, []).slice(0, 5);
}

const brandBrainPaletteColors = new Set([
  "#00E5FF",
  "#4CF2FF",
  "#0B0F19",
  "#141A26",
  "#1C2433",
  "#263244",
  "#F8FAFC",
  "#CBD5E1",
  "#94A3B8"
]);

export async function importBrandFromWebsite({
  fetcher,
  input,
  ownerUserId,
  repository
}: ImportBrandFromWebsiteParams): Promise<WebsiteImportResult> {
  const parsed = websiteImportInputSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: {
        code: "invalid_website_url",
        fieldErrors: {
          websiteUrl: ["Enter a valid website URL."]
        },
        message: "Check the website URL and try again."
      },
      ok: false,
      status: "failed"
    };
  }

  const fetchResult = await fetcher(parsed.data.websiteUrl);

  if (!fetchResult.ok) {
    return {
      error: {
        code: "website_fetch_failed",
        fieldErrors: {
          websiteUrl: [fetchResult.message]
        },
        message: fetchResult.message
      },
      ok: false,
      status: "failed"
    };
  }

  const profile = extractWebsiteBrandProfile(fetchResult.html);

  if (!profile.name) {
    return {
      error: {
        code: "website_metadata_missing",
        fieldErrors: {
          websiteUrl: ["BrandBrain could not find a brand name on this website."]
        },
        message: "BrandBrain could not find a brand name on this website."
      },
      ok: false,
      status: "failed"
    };
  }

  const createResult = await createBrandForUser({
    input: {
      description: profile.description,
      industry: null,
      name: profile.name,
      websiteUrl: normalizeImportedUrl(fetchResult.finalUrl, parsed.data.websiteUrl)
    },
    ownerUserId,
    repository
  });

  if (!createResult.ok) {
    return {
      error: {
        code: "brand_create_failed",
        fieldErrors:
          createResult.error.code === "duplicate_brand_name"
            ? {
                websiteUrl: ["This website maps to a brand you already imported."]
              }
            : undefined,
        message: createResult.error.message
      },
      ok: false,
      status: "failed"
    };
  }

  return {
    brand: createResult.brand,
    ok: true,
    status: "imported"
  };
}
