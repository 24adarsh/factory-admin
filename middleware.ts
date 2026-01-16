import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    /* ===============================
       Allow public routes
    =============================== */
    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    /* ===============================
       Protect /admin routes
    =============================== */
    if (pathname.startsWith("/admin")) {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        // ❌ Not logged in
        if (!token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }

        // ✅ Logged in (optional role check)
        // if (token.role !== "admin") {
        //   return NextResponse.redirect(new URL("/login", req.url));
        // }
    }

    return NextResponse.next();
}

/* ===============================
   Run middleware only here
=============================== */
export const config = {
    matcher: ["/admin/:path*"],
};
