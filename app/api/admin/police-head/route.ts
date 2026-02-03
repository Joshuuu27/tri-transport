import { NextResponse } from "next/server";
import { adminAuth, db, firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

// GET: Get current police head
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
    
    // Get user role
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can access this endpoint" },
        { status: 403 }
      );
    }

    // Find current police head
    const usersSnapshot = await db
      .collection("users")
      .where("role", "==", "police_head")
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json({ policeHead: null });
    }

    const policeHeadDoc = usersSnapshot.docs[0];
    const policeHeadData = policeHeadDoc.data();

    return NextResponse.json({
      policeHead: {
        uid: policeHeadDoc.id,
        email: policeHeadData.email,
        name: policeHeadData.name,
        role: policeHeadData.role,
      },
    });
  } catch (error: any) {
    console.error("Error getting police head:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get police head" },
      { status: 400 }
    );
  }
}

// POST: Update/assign police head (admin version)
export async function POST(req: Request) {
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
    
    // Get user role
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can assign police head" },
        { status: 403 }
      );
    }

    const { newPoliceHeadUid } = await req.json();

    if (!newPoliceHeadUid) {
      return NextResponse.json(
        { error: "Missing newPoliceHeadUid" },
        { status: 400 }
      );
    }

    // Check if the new police head is a police officer
    const newHeadDoc = await db.collection("users").doc(newPoliceHeadUid).get();
    
    if (!newHeadDoc.exists) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const newHeadData = newHeadDoc.data();
    const newHeadRole = newHeadData?.role;

    if (newHeadRole !== "police" && newHeadRole !== "police_head") {
      return NextResponse.json(
        { error: "The new police head must be a police officer" },
        { status: 400 }
      );
    }

    // Find all current police heads and demote them to regular police
    const currentHeadsSnapshot = await db
      .collection("users")
      .where("role", "==", "police_head")
      .get();

    const batch = db.batch();
    
    // Demote all current police heads to regular police
    for (const doc of currentHeadsSnapshot.docs) {
      batch.update(doc.ref, { role: "police" });
      // Update custom claims
      await adminAuth.setCustomUserClaims(doc.id, { role: "police" });
    }

    // Promote new police head
    batch.update(db.collection("users").doc(newPoliceHeadUid), { role: "police_head" });
    await adminAuth.setCustomUserClaims(newPoliceHeadUid, { role: "police_head" });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Police head updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating police head:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update police head" },
      { status: 400 }
    );
  }
}
