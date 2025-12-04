import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: operatorId } = await params;

  try {
    // Fetch all vehicles where operatorId matches
    const snapshot = await db
      .collection("vehicles")
      .where("operatorId", "==", operatorId)
      .get();

    const vehicles = snapshot.docs.map((doc) => ({
      id: doc.id,
      plateNumber: doc.data().plateNumber || "",
      vehicleType: doc.data().vehicleType || "",
      ...doc.data(),
    }));

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
