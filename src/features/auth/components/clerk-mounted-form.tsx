import { SignIn, SignUp } from "@clerk/nextjs";

import { getClerkAppearance } from "../services/clerk-appearance.service";
import type { AuthMode, AuthRouteConfig } from "../types/auth-route";

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

  return (
    <SignUp
      appearance={appearance}
      fallbackRedirectUrl={routes.afterSignUp}
      path={routes.signUp}
      routing="path"
      signInUrl={routes.signIn}
    />
  );
}
