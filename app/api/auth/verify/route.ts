import { NextResponse } from "next/server";
import { firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const cookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ valid: false });
    }

    const token = cookie.split("=")[1];

    const decoded = await firebaseAdmin
      .auth()
      .verifySessionCookie(token, true);

    return NextResponse.json({
      valid: true,
      role: decoded.role,
    });

  } catch (err) {
    return NextResponse.json({ valid: false });
  }
}
