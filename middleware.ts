import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // You can add role checks here later if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // token exists = authenticated
        return !!token;
      },
    },
  }
);

// 🔒 Protect only admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
