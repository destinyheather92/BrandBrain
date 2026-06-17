import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { getProtectedDashboardRoutes } from "./features/dashboard/services/dashboard-route.service";

const isProtectedDashboardRoute = createRouteMatcher(getProtectedDashboardRoutes());

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedDashboardRoute(request)) {
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
