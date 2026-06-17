import type { z } from "zod";

import type { authModeSchema, authRouteConfigSchema } from "../schemas/auth-route.schema";

export type AuthMode = z.infer<typeof authModeSchema>;
export type AuthRouteConfig = z.infer<typeof authRouteConfigSchema>;
