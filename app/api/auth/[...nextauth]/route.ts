export const runtime = "nodejs";

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Admin",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (
                    credentials?.email === process.env.ADMIN_EMAIL &&
                    credentials?.password === process.env.ADMIN_PASSWORD
                ) {
                    return {
                        id: "admin",
                        name: "Admin",
                        email: credentials?.email,
                        role: "admin",
                    };
                }
                return null;
            },
        }),
    ],

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
            }
            return session;
        },
    },

    pages: {
        signIn: "/login",
    },

    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
