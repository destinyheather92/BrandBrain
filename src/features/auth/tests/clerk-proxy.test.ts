import { describe, expect, it } from "vitest";

import { config } from "../../../proxy";

describe("Clerk proxy", () => {
  it("includes Clerk's required Next.js proxy matcher after API routes", () => {
    expect(config.matcher).toContain("/(api|trpc)(.*)");
    expect(config.matcher).toContain("/__clerk/:path*");
    expect(config.matcher.indexOf("/__clerk/:path*")).toBeGreaterThan(
      config.matcher.indexOf("/(api|trpc)(.*)")
    );
  });
});
