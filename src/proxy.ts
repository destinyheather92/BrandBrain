import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { getProtectedAppRoutes } from "./features/auth/services/protected-route.service";

const isProtectedAppRoute = createRouteMatcher(getProtectedAppRoutes());

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedAppRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*"
  ]
};
