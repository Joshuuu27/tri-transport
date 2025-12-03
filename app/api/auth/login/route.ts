// /app/api/login/route.ts
import { NextResponse } from "next/server";
import { firebaseAdmin, db, adminAuth } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";


export async function POST(req: Request) {
  try {
    const { uid, idToken } = await req.json();

     if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 1. Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken, true);

    const nuid = decoded.uid;
    const email = decoded.email ?? "";
    const name = decoded.name ?? "";
    const picture = decoded.picture ?? "";

    const userDoc = await db.collection("users").doc(nuid).get();
    let role = "user"; // default role

    if (!userDoc.exists) {
      await db.collection("users").doc(uid).set({
        nuid,
        email,
        name,
        picture,
        role: "user",
        provider: decoded.firebase?.sign_in_provider,
        createdAt: Date.now(),
        lastLogin: Date.now()
      });
    } else {
      role = userDoc.data()?.role ?? "user";
      await db.collection("users").doc(nuid).update({ lastLogin: Date.now() });
    }

    // 4. Attach custom claims (if missing)
    const existingClaims = decoded.role;

    if (!existingClaims) {
      await adminAuth.setCustomUserClaims(uid, { role });
    }
    

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
