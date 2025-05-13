import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow the request if the user is authenticated
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

// Protect all routes under /dashboard and /profile
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
}; 