import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Check if accessing own profile
    if (req.nextUrl.pathname.startsWith("/user/")) {
      const userId = req.nextUrl.pathname.split("/")[2];
      if (token?.id !== userId) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Protect all routes that require authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/user/:path*",
    "/booking/:path*",
    "/payment/:path*",
  ],
};