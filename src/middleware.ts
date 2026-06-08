import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = Boolean(req.auth);

  const isProtectedPage = pathname.startsWith("/cases");
  const isProtectedApi = pathname.startsWith("/api/cases");

  if (!isLoggedIn && (isProtectedPage || isProtectedApi)) {
    if (isProtectedApi) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/cases/:path*", "/api/cases/:path*"],
};
