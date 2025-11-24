import { NextResponse } from "next/server";
import { adminAuth, db } from "@/lib/firebase.admin";

export async function POST(req: Request) {
  
  try {

    const cookieHeader = req.headers.get("cookie") || "";
     const token = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

    // if (!token) return new Response("Unauthorized", { status: 401 });

    const { email, password, name, role } = await req.json();

    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name
    });

    // 2. Save extra user fields into Firestore (optional)
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      role,
      createdAt: Date.now()
    });

     await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ success: false,error: error.message }, { status: 400 });
  }
}
