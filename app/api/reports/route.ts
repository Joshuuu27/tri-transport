import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";


export async function POST(req: Request) {
  try {
    const { driverId, userId, message } = await req.json();
  

    await db.collection("reports").add({
      driverId,
      userId,
      message,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save report" }, { status: 500 });
  }
}
