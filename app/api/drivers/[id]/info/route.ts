import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

// Simple in-memory cache for driver names (reset on deployment)
const driverCache = new Map<string, string>();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const driverId = params.id;

    if (!driverId) {
      return NextResponse.json(
        { error: "Driver ID is required", driverName: "" },
        { status: 400 }
      );
    }

    // Check cache first
    if (driverCache.has(driverId)) {
      return NextResponse.json({ driverName: driverCache.get(driverId) || "" });
    }

    const driverDoc = await db.collection("users").doc(driverId).get();

    if (!driverDoc.exists) {
      driverCache.set(driverId, "");
      return NextResponse.json(
        { driverName: "" },
        { status: 200 }
      );
    }

    const driverData = driverDoc.data();
    // Try different field names for driver name
    let driverName = driverData?.name || driverData?.displayName || driverData?.firstName || "";
    if (driverData?.lastName && driverData?.firstName) {
      driverName = `${driverData.firstName} ${driverData.lastName}`;
    }

    // Cache the result
    driverCache.set(driverId, driverName);

    console.log(`[Driver Info API] Driver ${driverId}: "${driverName}"`);

    return NextResponse.json({ driverName });
  } catch (error) {
    console.error("Error fetching driver info:", error);
    return NextResponse.json(
      { driverName: "", error: "Failed to fetch driver information" },
      { status: 200 } // Return 200 with empty name so UI doesn't break
    );
  }
}
