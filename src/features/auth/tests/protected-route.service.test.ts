import { describe, expect, it } from "vitest";

import {
  getProtectedAppRoutes,
  isProtectedAppPath
} from "../services/protected-route.service";

describe("protected app route service", () => {
  it("protects dashboard, brand workspace, and canvas routes", () => {
    expect(getProtectedAppRoutes()).toEqual(["/dashboard(.*)", "/brands(.*)", "/canvas(.*)"]);
  });

  it("recognizes protected application paths", () => {
    expect(isProtectedAppPath("/dashboard")).toBe(true);
    expect(isProtectedAppPath("/dashboard/settings")).toBe(true);
    expect(isProtectedAppPath("/brands")).toBe(true);
    expect(isProtectedAppPath("/brands/new")).toBe(true);
    expect(isProtectedAppPath("/canvas")).toBe(true);
    expect(isProtectedAppPath("/canvas/model")).toBe(true);
    expect(isProtectedAppPath("/sign-in")).toBe(false);
  });
});
