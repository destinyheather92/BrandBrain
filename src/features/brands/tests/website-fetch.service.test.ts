import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWebsiteHtml } from "../services/website-fetch.service";

describe("fetchWebsiteHtml", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("inlines linked stylesheet content so website palette colors can be detected", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          `
            <html>
              <head>
                <link rel="stylesheet" href="/assets/site.css" />
                <meta property="og:site_name" content="Land Strong" />
              </head>
            </html>
          `,
          {
            headers: {
              "content-type": "text/html"
            },
            status: 200
          }
        )
      )
      .mockResolvedValueOnce(
        new Response(":root { --primary: #315B2C; --accent: #C49A3A; }", {
          headers: {
            "content-type": "text/css"
          },
          status: 200
        })
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchWebsiteHtml("https://landstrong.example/");

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://landstrong.example/assets/site.css",
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": "BrandBrainWebsiteImporter/1.0"
        })
      })
    );
    expect(result).toMatchObject({
      finalUrl: "https://landstrong.example/",
      ok: true
    });
    expect(result.ok ? result.html : "").toContain("#315B2C");
    expect(result.ok ? result.html : "").toContain("#C49A3A");
  });
});
