import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params;

  try {
    // Fetch vehicle from Firestore
    const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
    
    if (!vehicleDoc.exists) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const vehicleData = vehicleDoc.data();
    return NextResponse.json({
      id: vehicleDoc.id,
      ...vehicleData,
    });
  } catch (error: any) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch vehicle",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params;

  try {
    const updates = await req.json();

    // Verify vehicle exists
    const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleDoc.exists) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle franchise number update
    if (updates.franchiseNumber !== undefined) {
      updateData.franchiseNumber = updates.franchiseNumber
        ? updates.franchiseNumber.trim()
        : null;
    }

    // Handle driver assignment
    if (updates.assignedDriverId !== undefined) {
      updateData.assignedDriverId = updates.assignedDriverId || null;
    }

    if (updates.assignedDriverName !== undefined) {
      updateData.assignedDriverName = updates.assignedDriverName || null;
    }

    // Handle vehicle details updates
    if (updates.plateNumber !== undefined) {
      updateData.plateNumber = updates.plateNumber.trim();
    }

    if (updates.bodyNumber !== undefined) {
      updateData.bodyNumber = updates.bodyNumber.trim();
    }

    if (updates.vehicleType !== undefined) {
      updateData.vehicleType = updates.vehicleType.trim();
    }

    if (updates.color !== undefined) {
      updateData.color = updates.color.trim();
    }

    // Update vehicle
    await db.collection("vehicles").doc(vehicleId).update(updateData);

    return NextResponse.json({
      success: true,
      message: "Vehicle updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update vehicle",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: vehicleId } = await params;

  try {
    // Verify vehicle exists
    const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleDoc.exists) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    // Delete vehicle
    await db.collection("vehicles").doc(vehicleId).delete();

    return NextResponse.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete vehicle",
      },
      { status: 500 }
    );
  }
}


