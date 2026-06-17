import { z } from "zod";

export const authModeSchema = z.enum(["sign-in", "sign-up"]);

export const authRouteConfigSchema = z.object({
  signIn: z.literal("/sign-in"),
  signUp: z.literal("/sign-up"),
  afterSignIn: z.literal("/dashboard"),
  afterSignUp: z.literal("/dashboard")
});
