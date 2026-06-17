import { authRouteConfigSchema } from "../schemas/auth-route.schema";
import type { AuthMode, AuthRouteConfig } from "../types/auth-route";

const authRouteConfig = authRouteConfigSchema.parse({
  signIn: "/sign-in",
  signUp: "/sign-up",
  afterSignIn: "/dashboard",
  afterSignUp: "/dashboard"
});

export function getAuthRouteConfig(): AuthRouteConfig {
  return { ...authRouteConfig };
}

export function isAuthRoute(pathname: string): boolean {
  return pathname === authRouteConfig.signIn
    || pathname.startsWith(`${authRouteConfig.signIn}/`)
    || pathname === authRouteConfig.signUp
    || pathname.startsWith(`${authRouteConfig.signUp}/`);
}

export function parseAuthModeFromPath(pathname: string): AuthMode | null {
  if (pathname === authRouteConfig.signIn || pathname.startsWith(`${authRouteConfig.signIn}/`)) {
    return "sign-in";
  }

  if (pathname === authRouteConfig.signUp || pathname.startsWith(`${authRouteConfig.signUp}/`)) {
    return "sign-up";
  }

  return null;
}
