import { NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

export async function GET(req: Request) {
  try {
    // Verify the requester is an admin
    const cookieHeader = req.headers.get("cookie") || "";
    const cookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie.split("=")[1];
    const decoded = await firebaseAdmin.auth().verifySessionCookie(token, true);
    
    // Get user role from Firestore
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can access this endpoint" },
        { status: 403 }
      );
    }

    // Fetch all police officers (both police and police_head)
    // Firestore doesn't support "in" with array literals, so we fetch both separately
    const [policeSnapshot, headSnapshot] = await Promise.all([
      db.collection("users").where("role", "==", "police").get(),
      db.collection("users").where("role", "==", "police_head").get(),
    ]);

    const officers: Array<{ uid: string; email: string; name: string; role: string }> = [];
    
    policeSnapshot.docs.forEach((doc) => {
      officers.push({
        uid: doc.id,
        email: doc.data().email,
        name: doc.data().name,
        role: doc.data().role,
      });
    });
    
    headSnapshot.docs.forEach((doc) => {
      officers.push({
        uid: doc.id,
        email: doc.data().email,
        name: doc.data().name,
        role: doc.data().role,
      });
    });

    return NextResponse.json({ officers });
  } catch (error: any) {
    console.error("Error fetching police officers:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch police officers" },
      { status: 400 }
    );
  }
}
