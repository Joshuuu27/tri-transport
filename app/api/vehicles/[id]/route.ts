import { NextResponse } from "next/server";
import { db, adminAuth } from "@/lib/firebase.admin";
import * as bcrypt from "bcryptjs";

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
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required to delete a vehicle" },
        { status: 400 }
      );
    }

    // Get the current user's session from headers
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.replace("Bearer ", "");

    // Verify the token to get the user
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      console.log("Could not verify token, attempting alternative auth method");
      // Continue anyway - we'll verify password differently
    }

    // Get the user's credentials from Firestore
    const usersSnapshot = await db
      .collection("users")
      .where("role", "==", "franchising")
      .limit(100)
      .get();

    let passwordValid = false;
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      // Check if password matches using bcrypt
      if (userData.hashedPassword) {
        const isMatch = bcrypt.compareSync(password, userData.hashedPassword);
        if (isMatch) {
          passwordValid = true;
          break;
        }
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

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


