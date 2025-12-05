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
import { db, firebaseAdmin } from "@/lib/firebase.admin";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;
    console.log("DELETE /api/drivers/[id] called with driverId:", driverId);
    // Get the driver document to find associated data
    console.log("Fetching driver document...");
    const driverDoc = await db.collection("users").doc(driverId).get();

    if (!driverDoc.exists) {
      console.log("Driver not found");
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    const driverData = driverDoc.data();
    console.log("Driver data:", { role: driverData?.role, email: driverData?.email });

    // Check if driver has role "driver"
    if (driverData?.role !== "driver") {
      console.log("User is not a driver, role:", driverData?.role);
      return NextResponse.json(
        { error: "User is not a driver" },
        { status: 400 }
      );
    }

    // Delete driver from Firestore
    console.log("Deleting driver from users collection...");
    await db.collection("users").doc(driverId).delete();

    // Delete driver's license documents if they exist
    console.log("Deleting driver licenses...");
    try {
      const licensesSnapshot = await db
        .collection("driverLicenses")
        .where("driverId", "==", driverId)
        .get();

      for (const doc of licensesSnapshot.docs) {
        await doc.ref.delete();
      }
    } catch (e) {
      console.log("No licenses to delete or error:", e);
    }

    // Delete driver's vehicles if they exist
    console.log("Deleting driver vehicles...");
    try {
      const vehiclesSnapshot = await db
        .collection("vehicles")
        .where("driverId", "==", driverId)
        .get();

      for (const doc of vehiclesSnapshot.docs) {
        await doc.ref.delete();
      }
    } catch (e) {
      console.log("No vehicles to delete or error:", e);
    }

    // Delete driver's reports if they exist
    console.log("Deleting driver reports...");
    try {
      const reportsSnapshot = await db
        .collection("reportCases")
        .where("driverId", "==", driverId)
        .get();

      for (const doc of reportsSnapshot.docs) {
        await doc.ref.delete();
      }
    } catch (e) {
      console.log("No reports to delete or error:", e);
    }

    // Delete driver's commendations if they exist
    console.log("Deleting driver commendations...");
    try {
      const commendationsSnapshot = await db
        .collection("commendations")
        .where("driverId", "==", driverId)
        .get();

      for (const doc of commendationsSnapshot.docs) {
        await doc.ref.delete();
      }
    } catch (e) {
      console.log("No commendations to delete or error:", e);
    }

    // Delete driver's SOS alerts if they exist
    console.log("Deleting driver SOS alerts...");
    try {
      const sosAlertsSnapshot = await db
        .collection("sos_alerts")
        .where("userId", "==", driverId)
        .get();

      for (const doc of sosAlertsSnapshot.docs) {
        await doc.ref.delete();
      }
    } catch (e) {
      console.log("No SOS alerts to delete or error:", e);
    }

    console.log("Driver deletion completed successfully");
    return NextResponse.json(
      { success: true, message: "Driver and associated data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error DELETE /api/drivers/[id]:", errorMessage);
    console.error("Full error:", error);
    return NextResponse.json(
      { error: `Failed to delete driver: ${errorMessage}` },
      { status: 500 }
    );
  }
}


