const protectedAppRoutes = ["/dashboard(.*)", "/brands(.*)", "/canvas(.*)", "/projects(.*)"] as const;

export function getProtectedAppRoutes(): string[] {
  return [...protectedAppRoutes];
}

export function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/brands" ||
    pathname.startsWith("/brands/") ||
    pathname === "/canvas" ||
    pathname.startsWith("/canvas/") ||
    pathname === "/projects" ||
    pathname.startsWith("/projects/")
  );
}
