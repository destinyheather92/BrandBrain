import { z } from "zod";

function addSchemeWhenMissing(value: string) {
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
}

const websiteUrlSchema = z
  .string()
  .trim()
  .min(1, "Website URL is required.")
  .transform(addSchemeWhenMissing)
  .pipe(
    z
      .string()
      .url("Enter a valid website URL.")
      .refine((value) => {
        let protocol: string;

        try {
          protocol = new URL(value).protocol;
        } catch {
          return false;
        }

        return protocol === "http:" || protocol === "https:";
      }, "Enter a valid website URL.")
      .transform((value) => new URL(value).toString())
  );

export const websiteImportInputSchema = z.object({
  websiteUrl: websiteUrlSchema
});
