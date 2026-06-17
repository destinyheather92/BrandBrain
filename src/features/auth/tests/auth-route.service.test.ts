import { describe, expect, it } from "vitest";

import {
  getAuthRouteConfig,
  isAuthRoute,
  parseAuthModeFromPath
} from "../services/auth-route.service";

describe("auth route service", () => {
  it("defines the Clerk routes BrandBrain exposes for feature 1", () => {
    expect(getAuthRouteConfig()).toEqual({
      signIn: "/sign-in",
      signUp: "/sign-up",
      afterSignIn: "/dashboard",
      afterSignUp: "/dashboard"
    });
  });

  it("recognizes sign-in and sign-up as the only public auth routes", () => {
    expect(isAuthRoute("/sign-in")).toBe(true);
    expect(isAuthRoute("/sign-in/factor-one")).toBe(true);
    expect(isAuthRoute("/sign-up")).toBe(true);
    expect(isAuthRoute("/dashboard")).toBe(false);
  });

  it("parses the auth mode from a requested path", () => {
    expect(parseAuthModeFromPath("/sign-in")).toBe("sign-in");
    expect(parseAuthModeFromPath("/sign-up/sso-callback")).toBe("sign-up");
    expect(parseAuthModeFromPath("/")).toBeNull();
  });
});
