import { getAuthRouteConfig } from "../services/auth-route.service";
import type { AuthMode } from "../types/auth-route";
import { MissingClerkKeysPanel } from "./missing-clerk-keys-panel";

type ClerkAuthCardProps = {
  clerkConfigured: boolean;
  mode: AuthMode;
};

export async function ClerkAuthCard({ clerkConfigured, mode }: ClerkAuthCardProps) {
  if (!clerkConfigured) {
    return <MissingClerkKeysPanel />;
  }

  const routes = getAuthRouteConfig();
  const { ClerkMountedForm } = await import("./clerk-mounted-form");

  return <ClerkMountedForm mode={mode} routes={routes} />;
}
