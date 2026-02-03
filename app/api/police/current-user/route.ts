import { NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

export async function GET(req: Request) {
  try {
    // Verify the requester is authenticated
    const cookieHeader = req.headers.get("cookie") || "";
    const cookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie.split("=")[1];
    const decoded = await firebaseAdmin.auth().verifySessionCookie(token, true);
    
    // Get user data from Firestore
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    
    return NextResponse.json({
      uid: decoded.uid,
      email: userData?.email,
      name: userData?.name,
      role: userData?.role || "police",
      isPoliceHead: userData?.role === "police_head",
    });
  } catch (error: any) {
    console.error("Error getting current user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get user information" },
      { status: 400 }
    );
  }
}
