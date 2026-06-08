import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { isGoogleAuthConfigured } from "@/lib/auth/google-configured";

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  providers: isGoogleAuthConfigured()
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [],
  pages: {
    signIn: "/login",
  },
  trustHost: true,
} satisfies NextAuthConfig;
