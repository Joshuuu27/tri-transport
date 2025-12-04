import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params;

  try {
    const { driverId } = await req.json();

    // Verify vehicle exists
    const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleDoc.exists) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    let updateData: any = {
      updatedAt: new Date(),
    };

    // If driverId is provided, assign the driver
    if (driverId && driverId.trim()) {
      // Verify driver exists and has driver role
      const driverDoc = await db.collection("users").doc(driverId).get();
      if (!driverDoc.exists || driverDoc.data()?.role !== "driver") {
        return NextResponse.json(
          { error: "Driver not found or invalid" },
          { status: 404 }
        );
      }

      const driverData = driverDoc.data();
      updateData.assignedDriverId = driverId;
      updateData.assignedDriverName = driverData?.name || "";
      updateData.lastAssignedAt = new Date();
    } else {
      // Unassign driver if empty string
      updateData.assignedDriverId = null;
      updateData.assignedDriverName = null;
    }

    // Update vehicle with driver assignment
    await db.collection("vehicles").doc(vehicleId).update(updateData);

    // Update driver document with assigned vehicle (if assigning)
    if (driverId && driverId.trim()) {
      await db.collection("users").doc(driverId).update({
        assignedVehicleId: vehicleId,
        lastVehicleAssignmentAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: driverId && driverId.trim() 
        ? "Driver assigned successfully"
        : "Driver unassigned successfully",
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
