import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Protect admin pages
  if (pathname.startsWith("/admin")) {
    const admin = request.cookies.get("admin");

    if (!admin) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
