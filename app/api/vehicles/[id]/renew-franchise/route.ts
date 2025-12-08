import { NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/lib/firebase.admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params;
  const body = await req.json();
  const { franchiseExpirationDate } = body;

  try {
    if (!franchiseExpirationDate) {
      return NextResponse.json(
        { error: "Franchise expiration date is required" },
        { status: 400 }
      );
    }

    const newExpirationDate = new Date(franchiseExpirationDate);
    const renewalDate = new Date();

    // Get current vehicle data
    const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleDoc.exists) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const vehicleData = vehicleDoc.data();
    const renewalHistory = vehicleData?.renewalHistory || [];

    // Add new renewal entry to history with proper Firestore Timestamps
    renewalHistory.push({
      renewalDate: firebaseAdmin.firestore.Timestamp.fromDate(renewalDate),
      expirationDate: firebaseAdmin.firestore.Timestamp.fromDate(newExpirationDate),
      type: "renewal",
      remarks: "Franchise renewed",
    });

    // Update vehicle with new expiration date and renewal history
    await db.collection("vehicles").doc(vehicleId).update({
      franchiseExpirationDate: firebaseAdmin.firestore.Timestamp.fromDate(newExpirationDate),
      renewalHistory: renewalHistory,
      updatedAt: firebaseAdmin.firestore.Timestamp.fromDate(renewalDate),
    });

    return NextResponse.json({
      success: true,
      message: "Franchise renewed successfully",
    });
  } catch (error) {
    console.error("Error renewing franchise:", error);
    return NextResponse.json(
      { error: "Failed to renew franchise" },
      { status: 500 }
    );
  }
}
