import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const doc = await db.collection("users").doc(params.id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("Error GET /api/drivers/[id]:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    await db.collection("users").doc(params.id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DELETE /api/drivers/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete driver" },
      { status: 500 }
    );
  }
}


