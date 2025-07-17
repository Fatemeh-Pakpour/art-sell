// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { compare } from "bcryptjs";

const prisma = new PrismaClient();

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });
                if (!user) throw new Error("No user found");
                const isValid = await compare(credentials.password, user.password);
                if (!isValid) throw new Error("Bad password");
                return { id: user.id, email: user.email, name: user.name };
            }
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // session.user.id = token.sub;
            }
            return session;
        }
    },
    pages: {
        signIn: '/auth/login',
        signOut: '/auth/signout',
        error: '/auth/error',
    }
});
