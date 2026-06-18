import { describe, expect, it } from "vitest";

import {
  getProtectedAppRoutes,
  isProtectedAppPath
} from "../services/protected-route.service";

describe("protected app route service", () => {
  it("protects dashboard, brand workspace, canvas, and project routes", () => {
    expect(getProtectedAppRoutes()).toEqual([
      "/dashboard(.*)",
      "/brands(.*)",
      "/canvas(.*)",
      "/projects(.*)"
    ]);
  });

  it("recognizes protected application paths", () => {
    expect(isProtectedAppPath("/dashboard")).toBe(true);
    expect(isProtectedAppPath("/dashboard/settings")).toBe(true);
    expect(isProtectedAppPath("/brands")).toBe(true);
    expect(isProtectedAppPath("/brands/new")).toBe(true);
    expect(isProtectedAppPath("/canvas")).toBe(true);
    expect(isProtectedAppPath("/canvas/model")).toBe(true);
    expect(isProtectedAppPath("/projects")).toBe(true);
    expect(isProtectedAppPath("/projects/project_123")).toBe(true);
    expect(isProtectedAppPath("/sign-in")).toBe(false);
  });
});
