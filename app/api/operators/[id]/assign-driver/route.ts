import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: operatorId } = await params;

  try {
    const { driverId, vehicleId } = await req.json();

    if (!driverId || !vehicleId) {
      return NextResponse.json(
        { error: "Driver ID and Vehicle ID are required" },
        { status: 400 }
      );
    }

    // Verify operator exists
    const operatorDoc = await db.collection("users").doc(operatorId).get();
    if (!operatorDoc.exists) {
      return NextResponse.json(
        { error: "Operator not found" },
        { status: 404 }
      );
    }

    // Verify driver exists
    const driverDoc = await db.collection("users").doc(driverId).get();
    if (!driverDoc.exists || driverDoc.data()?.role !== "driver") {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    // Verify vehicle exists and belongs to operator
    const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleDoc.exists || vehicleDoc.data()?.operatorId !== operatorId) {
      return NextResponse.json(
        { error: "Vehicle not found or does not belong to this operator" },
        { status: 404 }
      );
    }

    // Update vehicle with assigned driver
    await db.collection("vehicles").doc(vehicleId).update({
      assignedDriverId: driverId,
      assignedDriverName: driverDoc.data()?.name || "",
      lastAssignedAt: new Date(),
    });

    // Optionally, update driver document with assigned vehicle
    await db.collection("users").doc(driverId).update({
      assignedVehicleId: vehicleId,
      assignedOperatorId: operatorId,
    });

    return NextResponse.json({
      success: true,
      message: "Driver assigned successfully",
    });
  } catch (error: any) {
    console.error("Error assigning driver:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to assign driver",
      },
      { status: 500 }
    );
  }
}
