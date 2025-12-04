import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function POST(req: Request) {
  try {
    const { driverId, userId, message, rating } = await req.json();

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await db.collection("commendations").add({
      driverId,
      userId,
      message,
      rating: rating || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save commendation" }, { status: 500 });
  }
}
