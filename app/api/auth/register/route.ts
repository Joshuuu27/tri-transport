import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function POST(req: Request) {
  try {
    const { uid, email, name, role } = await req.json();

    if (!uid) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    // Save user profile to Firestore
    await db.collection("users").doc(uid).set({
      uid,
      email,
      name,
      role: role || "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    return NextResponse.json({ success: true, uid });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
