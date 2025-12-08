import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get("driverId");

    let query: any = db.collection("reports");

    // If driverId is provided, filter by driver
    if (driverId) {
      query = query.where("driverId", "==", driverId);
    }

    // Order by creation date descending
    query = query.orderBy("createdAt", "desc");
    const snapshot = await query.get();

    const reports = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        incidentDate: data.incidentDate?.toDate?.() || null,
      };
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

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
