import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        // 🔒 Guard: ensure env vars exist (prevents Configuration error)
        if (
          !process.env.ADMIN_EMAIL ||
          !process.env.ADMIN_PASSWORD ||
          !process.env.NEXTAUTH_SECRET
        ) {
          console.error("❌ Missing auth environment variables");
          throw new Error("Auth environment not configured");
        }

        console.log("Authorize called:", credentials);

        // ✅ Admin credentials check
        if (
          credentials?.email === process.env.ADMIN_EMAIL &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "admin",
            name: "Admin",
            email: credentials.email,
          };
        }

        // ❌ Invalid credentials
        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
