const protectedAppRoutes = ["/dashboard(.*)", "/brands(.*)"] as const;

export function getProtectedAppRoutes(): string[] {
  return [...protectedAppRoutes];
}

export function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/brands" ||
    pathname.startsWith("/brands/")
  );
}
