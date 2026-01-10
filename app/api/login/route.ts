export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const res = NextResponse.json({ success: true });

    // Secure cookie
    res.cookies.set("admin", "true", {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  }

  return NextResponse.json(
    { error: "Invalid credentials" },
    { status: 401 }
  );
}

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Allow public routes
//   if (
//     pathname === "/login" ||
//     pathname === "/admin/login" ||
//     pathname.startsWith("/api") ||
//     pathname === "/"
//   ) {
//     return NextResponse.next();
//   }

//   // Protect admin pages
//   if (pathname.startsWith("/admin")) {
//     const admin = request.cookies.get("admin");

//     if (!admin) {
//       return NextResponse.redirect(new URL("/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };


