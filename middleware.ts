import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // call our verify endpoint
  const verifyRes = await fetch(`${req.nextUrl.origin}/api/auth/verify`, {
    method: "POST",
    headers: {
      cookie: req.headers.get("cookie") || "",
    },
  });

  const data = await verifyRes.json();
  const { valid, role } = data;

// const role = "admin";
// const valid = true;

  const path = req.nextUrl.pathname;

  // not logged in
  if (!valid) {
    if (!path.startsWith("/login")) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // already logged in → redirect away from login
  if (path.startsWith("/login")) {
    if (role === "admin") url.pathname = "/admin";
    else if (role === "driver") url.pathname = "/driver";
    else if (role === "franchising") url.pathname = "/franchising";
    else url.pathname = "/user";
    return NextResponse.redirect(url);
  }

  // route protection
  if (path.startsWith("/admin") && role !== "admin") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }
  if (path.startsWith("/driver") && role !== "driver") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  if(path.startsWith("/user") && role !== "user") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  if(path.startsWith("/franchising") && role !== "franchising") {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/driver/:path*", "/user/:path*","/franchising/:path*", "/login"],
};
