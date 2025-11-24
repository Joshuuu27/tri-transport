// /app/api/login/route.ts
import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";


export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();
    const expiresIn = 60 * 60 * 24 * 1000;
    const sessionCookie = await firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ status: "success" });
    
    // ✅ set cookie on response
    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
