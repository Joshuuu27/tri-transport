import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: driverId } = await params;

    // Fetch driver document
    const driverDoc = await db.collection("users").doc(driverId).get();

    if (!driverDoc.exists) {
      return NextResponse.json(
        { error: "Driver not found" },
        { status: 404 }
      );
    }

    const driverData = driverDoc.data();

    // Fetch driver's license with all details
    let licenseInfo: any = null;
    try {
      const licenseSnap = await db
        .collection("driverLicenses")
        .doc(driverId)
        .get();

      if (licenseSnap.exists) {
        const licenseData = licenseSnap.data();
        licenseInfo = {
          licenseNumber: licenseData?.licenseNumber || "",
          issueDate: licenseData?.issueDate?.toDate?.() || null,
          expiryDate: licenseData?.expiryDate?.toDate?.() || null,
          updatedAt: licenseData?.updatedAt?.toDate?.() || null,
        };
      }
    } catch (error) {
      console.error("Error fetching license:", error);
    }

    // Fetch driver's first vehicle with all details
    let vehicleInfo: any = null;
    let operatorInfo: any = null;

    try {
      const vehiclesSnap = await db
        .collection("vehicles")
        .where("assignedDriverId", "==", driverId)
        .limit(1)
        .get();

      if (!vehiclesSnap.empty) {
        const vehicleDoc = vehiclesSnap.docs[0];
        const vehicleData = vehicleDoc.data();

        vehicleInfo = {
          id: vehicleDoc.id,
          vehicleType: vehicleData.vehicleType || "",
          plateNumber: vehicleData.plateNumber || "",
          bodyNumber: vehicleData.bodyNumber || "",
          color: vehicleData.color || "",
          franchiseNumber: vehicleData.franchiseNumber || "",
          franchiseExpirationDate: vehicleData.franchiseExpirationDate?.toDate?.() || null,
          dateAdded: vehicleData.dateAdded?.toDate?.() || null,
          operatorId: vehicleData.operatorId || "",
          renewalHistory: vehicleData.renewalHistory || [],
        };

        // If vehicle has operatorId, fetch operator details
        if (vehicleData.operatorId) {
          try {
            const operatorDoc = await db
              .collection("users")
              .doc(vehicleData.operatorId)
              .get();

            if (operatorDoc.exists) {
              const operatorData = operatorDoc.data();
              operatorInfo = {
                id: operatorDoc.id,
                name: operatorData?.displayName || operatorData?.name || "",
                email: operatorData?.email || "",
                franchiseNumber: operatorData?.franchiseNumber || "",
                companyName: operatorData?.companyName || "",
                phone: operatorData?.phone || "",
              };
            }
          } catch (error) {
            console.error("Error fetching operator:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    }

    return NextResponse.json({
      id: driverId,
      ...driverData,
      license: licenseInfo,
      vehicle: vehicleInfo,
      operator: operatorInfo,
    });
  } catch (error: any) {
    console.error("Error GET /api/drivers/[id]/full-profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch driver profile" },
      { status: 500 }
    );
  }
}
