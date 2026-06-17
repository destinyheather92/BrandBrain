const protectedDashboardRoutes = ["/dashboard(.*)"] as const;

export function getProtectedDashboardRoutes(): string[] {
  return [...protectedDashboardRoutes];
}

export function isDashboardPath(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}
