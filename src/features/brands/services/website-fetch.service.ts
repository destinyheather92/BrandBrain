import type { WebsiteFetchResult } from "../types/website-import";

const htmlContentTypePattern = /\btext\/html\b/i;

export async function fetchWebsiteHtml(url: string): Promise<WebsiteFetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "BrandBrainWebsiteImporter/1.0"
      },
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

    return {
      finalUrl: response.url || url,
      html,
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
