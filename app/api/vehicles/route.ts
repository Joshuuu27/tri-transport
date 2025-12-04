import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const operatorId = searchParams.get("operatorId");

    let query: any = db.collection("vehicles");

    // Filter by operator if operatorId is provided
    if (operatorId) {
      query = query.where("operatorId", "==", operatorId);
    }

    const snapshot = await query.get();

    const vehicles = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const vehicleData = doc.data();
        let operatorName = "Unknown";

        // Fetch operator name if operatorId exists
        if (vehicleData.operatorId) {
          try {
            const operatorDoc = await db
              .collection("users")
              .doc(vehicleData.operatorId)
              .get();
            if (operatorDoc.exists) {
              operatorName = operatorDoc.data()?.name || "Unknown";
            }
          } catch (error) {
            console.error("Error fetching operator:", error);
          }
        }

        return {
          id: doc.id,
          operatorName,
          ...vehicleData,
        };
      })
    );

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { plateNumber, bodyNumber, vehicleType, color, franchiseNumber, operatorId } = await req.json();

    if (!plateNumber || !bodyNumber || !vehicleType || !color || !operatorId) {
      return NextResponse.json(
        { error: "Plate number, body number, vehicle type, color, and operator ID are required" },
        { status: 400 }
      );
    }

    // Create new vehicle document
    const vehicleRef = await db.collection("vehicles").add({
      plateNumber: plateNumber.trim(),
      bodyNumber: bodyNumber.trim(),
      vehicleType: vehicleType.trim(),
      color: color.trim(),
      franchiseNumber: franchiseNumber ? franchiseNumber.trim() : null,
      operatorId,
      assignedDriverId: null,
      assignedDriverName: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: vehicleRef.id,
      message: "Vehicle added successfully",
    });
  } catch (error: any) {
    console.error("Error adding vehicle:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to add vehicle",
      },
      { status: 500 }
    );
  }
}
