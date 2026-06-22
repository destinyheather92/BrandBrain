import type { WebsiteFetchResult } from "../types/website-import";

const htmlContentTypePattern = /\btext\/html\b/i;
const stylesheetContentTypePattern = /\btext\/css\b/i;
const maxLinkedStylesheets = 4;
const requestHeaders = {
  "User-Agent": "BrandBrainWebsiteImporter/1.0"
};

export async function fetchWebsiteHtml(url: string): Promise<WebsiteFetchResult> {
  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return {
        message: "BrandBrain could not reach this website.",
        ok: false,
        status: "http_error"
      };
    }

    const contentType = response.headers.get("content-type");

    if (contentType && !htmlContentTypePattern.test(contentType)) {
      return {
        message: "The website returned a non-HTML response.",
        ok: false,
        status: "non_html_response"
      };
    }

    const html = await response.text();

    if (!html.trim()) {
      return {
        message: "The website returned an empty page.",
        ok: false,
        status: "empty_response"
      };
    }
    const enrichedHtml = await appendLinkedStylesheetContent(html, response.url || url);

    return {
      finalUrl: response.url || url,
      html: enrichedHtml,
      ok: true
    };
  } catch (error) {
    console.error("Website import fetch failed", {
      error: error instanceof Error ? error.message : "Unknown fetch error",
      url
    });

    return {
      message: "BrandBrain could not reach this website.",
      ok: false,
      status: "network_error"
    };
  }
}

async function appendLinkedStylesheetContent(html: string, baseUrl: string): Promise<string> {
  const stylesheetUrls = extractStylesheetUrls(html, baseUrl);

  if (stylesheetUrls.length === 0) {
    return html;
  }

  const stylesheetBodies = await Promise.all(stylesheetUrls.map(fetchStylesheetText));
  const inlineStyles = stylesheetBodies
    .filter((stylesheet): stylesheet is string => Boolean(stylesheet))
    .map((stylesheet, index) => `<style data-brandbrain-imported-css="${index + 1}">\n${stylesheet}\n</style>`)
    .join("\n");

  return inlineStyles ? `${html}\n${inlineStyles}` : html;
}

function extractStylesheetUrls(html: string, baseUrl: string): string[] {
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const stylesheetUrls: string[] = [];

  for (const tag of linkTags) {
    if (!/\brel\s*=\s*(?:"[^"]*\bstylesheet\b[^"]*"|'[^']*\bstylesheet\b[^']*'|[^\s"'>]*stylesheet[^\s"'>]*)/i.test(tag)) {
      continue;
    }

    const href = getRawAttribute(tag, "href");

    if (!href) {
      continue;
    }

    const stylesheetUrl = resolveStylesheetUrl(href, baseUrl);

    if (stylesheetUrl && !stylesheetUrls.includes(stylesheetUrl)) {
      stylesheetUrls.push(stylesheetUrl);
    }

    if (stylesheetUrls.length >= maxLinkedStylesheets) {
      break;
    }
  }

  return stylesheetUrls;
}

async function fetchStylesheetText(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: requestHeaders,
      redirect: "follow",
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type");

    if (contentType && !stylesheetContentTypePattern.test(contentType)) {
      return null;
    }

    const stylesheet = await response.text();

    return stylesheet.slice(0, 50000);
  } catch {
    return null;
  }
}

function getRawAttribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i");
  const match = tag.match(pattern);
  const value = match?.[1] ?? match?.[2] ?? match?.[3];

  return value?.trim() || null;
}

function resolveStylesheetUrl(href: string, baseUrl: string): string | null {
  try {
    const parsed = new URL(href, baseUrl);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
