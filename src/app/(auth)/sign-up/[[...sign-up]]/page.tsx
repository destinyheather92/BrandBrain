import { BrandBrainAuthShell } from "@/features/auth/components/brandbrain-auth-shell";
import { ClerkAuthCard } from "@/features/auth/components/clerk-auth-card";
import { isClerkConfigured } from "@/lib/env";

export default function SignUpPage() {
  return (
    <BrandBrainAuthShell mode="sign-up">
      <ClerkAuthCard clerkConfigured={isClerkConfigured()} mode="sign-up" />
    </BrandBrainAuthShell>
  );
}
