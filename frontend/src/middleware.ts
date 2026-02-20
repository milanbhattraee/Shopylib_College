import { NextResponse } from "next/server";

const publicPaths = ["/", "/products", "/categories", "/search"];
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

export function middleware(req) {
  const token = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith("/products/") ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Redirect logged-in users away from auth pages
  if (authPaths.some((p) => pathname.startsWith(p))) {
    if (token) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // Protected routes – require token
  const protectedPaths = ["/cart", "/wishlist", "/orders", "/profile", "/checkout", "/reviews", "/admin"];
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!token) return NextResponse.redirect(new URL("/?login=true", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api).*)"],
};
