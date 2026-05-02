// src/lib/auth.ts

import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";
import type { Role } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {},
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new Error("Invalid input");
        }

        const user = await db.user
          .findUnique({
            where: { email: parsed.data.email },
          })
          .catch(() => {
            throw new Error(
              "Database is not ready. Create the database and run Prisma migrations."
            );
          });

        if (!user) {
          throw new Error("User not found");
        }

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.password
        );

        if (!valid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = (token.role ?? "USER") as Role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}
