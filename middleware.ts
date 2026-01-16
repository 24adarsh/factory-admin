import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // ✅ Public routes
    if (
        pathname.startsWith("/login") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/_next") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // 🔒 Protect admin routes
    if (pathname.startsWith("/admin")) {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token) {
            const loginUrl = new URL("/login", req.url);
            loginUrl.searchParams.set("callbackUrl", pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}
