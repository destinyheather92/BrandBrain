import { describe, expect, it } from "vitest";

import {
  getProtectedAppRoutes,
  isProtectedAppPath
} from "../services/protected-route.service";

describe("protected app route service", () => {
  it("protects dashboard, brand workspace, canvas, project, and asset routes", () => {
    expect(getProtectedAppRoutes()).toEqual([
      "/dashboard(.*)",
      "/brands(.*)",
      "/canvas(.*)",
      "/projects(.*)",
      "/assets(.*)"
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
    expect(isProtectedAppPath("/assets")).toBe(true);
    expect(isProtectedAppPath("/assets/library")).toBe(true);
    expect(isProtectedAppPath("/sign-in")).toBe(false);
  });
});
