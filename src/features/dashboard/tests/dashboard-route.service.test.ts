import { describe, expect, it } from "vitest";

import {
  getProtectedDashboardRoutes,
  isDashboardPath
} from "../services/dashboard-route.service";

describe("dashboard route service", () => {
  it("declares the Clerk matcher for the protected dashboard", () => {
    expect(getProtectedDashboardRoutes()).toEqual(["/dashboard(.*)"]);
  });

  it("identifies dashboard URLs without swallowing other app routes", () => {
    expect(isDashboardPath("/dashboard")).toBe(true);
    expect(isDashboardPath("/dashboard/projects")).toBe(true);
    expect(isDashboardPath("/sign-in")).toBe(false);
    expect(isDashboardPath("/brands")).toBe(false);
  });
});
