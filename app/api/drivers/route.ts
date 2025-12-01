import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      // return single driver
      const doc = await db.collection("users").doc(id).get();

      if (!doc.exists) {
        return NextResponse.json({ error: "Driver not found" }, { status: 404 });
      }

      return NextResponse.json({ id: doc.id, ...doc.data() });
    }

    // return all drivers (default)
    const snap = await db
      .collection("users")
      .where("role", "==", "driver")
      .get();

    const drivers = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(drivers);
  } catch (error) {
    console.error("Error GET /api/drivers:", error);
    return NextResponse.json(
      { error: "Failed to fetch drivers" },
      { status: 500 }
    );
  }
}
