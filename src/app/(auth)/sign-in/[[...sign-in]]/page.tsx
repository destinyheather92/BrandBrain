import { BrandBrainAuthShell } from "@/features/auth/components/brandbrain-auth-shell";
import { ClerkAuthCard } from "@/features/auth/components/clerk-auth-card";
import { isClerkConfigured } from "@/lib/env";

export default function SignInPage() {
  return (
    <BrandBrainAuthShell mode="sign-in">
      <ClerkAuthCard clerkConfigured={isClerkConfigured()} mode="sign-in" />
    </BrandBrainAuthShell>
  );
}
