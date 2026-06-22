import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

describe("Next config", () => {
  it("allows editor server actions to submit large editable canvas payloads", () => {
    expect(nextConfig.experimental?.serverActions?.bodySizeLimit).toBe("10mb");
  });
});
