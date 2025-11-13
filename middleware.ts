// middleware.ts (root of your Next.js project)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const verified = token ? verifyToken(token) : null;
console.log("Verified token:", verified);
  const { pathname } = req.nextUrl;

  // ✅ If user is logged in, block access to login/register
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // ✅ If user is not logged in, block access to protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to specific routes
export const config = {
  matcher: ["/login", "/register", "/dashboard/:path*", "/profile/:path*", "/settings/:path*"],
};