import { SignIn } from "@clerk/nextjs";

import { getClerkAppearance } from "../services/clerk-appearance.service";
import type { AuthMode, AuthRouteConfig } from "../types/auth-route";
import { SignUpProfileCapture } from "./sign-up-profile-capture";

type ClerkMountedFormProps = {
  mode: AuthMode;
  routes: AuthRouteConfig;
};

export function ClerkMountedForm({ mode, routes }: ClerkMountedFormProps) {
  const appearance = getClerkAppearance();

  if (mode === "sign-in") {
    return (
      <SignIn
        appearance={appearance}
        fallbackRedirectUrl={routes.afterSignIn}
        path={routes.signIn}
        routing="path"
        signUpUrl={routes.signUp}
      />
    );
  }

  return <SignUpProfileCapture appearance={appearance} routes={routes} />;
}
