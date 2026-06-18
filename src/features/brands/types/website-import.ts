import type { z } from "zod";

import type { websiteImportInputSchema } from "../schemas/website-import.schema";
import type { Brand } from "./brand";

export type WebsiteImportInput = z.input<typeof websiteImportInputSchema>;
export type WebsiteImportForUserInput = z.infer<typeof websiteImportInputSchema>;

export type WebsiteBrandProfile = {
  description: string | null;
  name: string | null;
};

export type WebsiteFetchFailureStatus =
  | "empty_response"
  | "http_error"
  | "network_error"
  | "non_html_response";

export type WebsiteFetchResult =
  | {
      finalUrl: string;
      html: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
      status: WebsiteFetchFailureStatus;
    };

export type WebsiteImportFetcher = (url: string) => Promise<WebsiteFetchResult>;

export type WebsiteImportResult =
  | {
      brand: Brand;
      ok: true;
      status: "imported";
    }
  | {
      error: {
        code:
          | "brand_create_failed"
          | "invalid_website_url"
          | "website_fetch_failed"
          | "website_metadata_missing";
        fieldErrors?: Partial<Record<keyof WebsiteImportInput, string[]>>;
        message: string;
      };
      ok: false;
      status: "failed";
    };
