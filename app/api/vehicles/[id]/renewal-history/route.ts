import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";
import { Timestamp, QueryDocumentSnapshot, DocumentData } from "firebase-admin/firestore";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: vehicleId } = await params;

    // First, check if vehicle exists and has renewalHistory array field
    const vehicleDoc = await db.collection("vehicles").doc(vehicleId).get();
    if (!vehicleDoc.exists) {
      return NextResponse.json(
        { error: "Vehicle not found" },
        { status: 404 }
      );
    }

    const vehicleData = vehicleDoc.data();
    let history: any[] = [];

    // Check if renewalHistory exists as array field on the vehicle
    if (vehicleData?.renewalHistory && Array.isArray(vehicleData.renewalHistory)) {
      history = vehicleData.renewalHistory.map((record: any, index: number) => ({
        id: `record_${index}`,
        date: record.renewalDate?.toDate?.() || new Date(record.renewalDate),
        renewalDate: record.renewalDate?.toDate?.() || new Date(record.renewalDate),
        notes: record.remarks || record.notes || "",
      }));
    } else {
      // Fallback: Try to get from subcollection
      const renewalSnapshot = await db
        .collection("vehicles")
        .doc(vehicleId)
        .collection("renewalHistory")
        .orderBy("renewalDate", "desc")
        .get();

      history = renewalSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          date: data.date?.toDate?.() || new Date(),
          renewalDate: data.renewalDate?.toDate?.() || new Date(),
          notes: data.notes || "",
        };
      });
    }

    return NextResponse.json(history);
  } catch (error: any) {
    console.error("Error fetching renewal history:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch renewal history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id: vehicleId } = await params;
    const body = await req.json();
    const { renewalDate, notes } = body;

    if (!renewalDate) {
      return NextResponse.json(
        { error: "Renewal date is required" },
        { status: 400 }
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

    const vehicleData = vehicleDoc.data();
    const newRecord = {
      renewalDate: Timestamp.fromDate(new Date(renewalDate)),
      date: Timestamp.now(),
      notes: notes || "",
      remarks: notes || "",
    };

    // Get existing renewal history array or create new one
    const existingHistory = vehicleData?.renewalHistory || [];
    const updatedHistory = [newRecord, ...existingHistory];

    // Update the renewalHistory array field on the vehicle document
    await db.collection("vehicles").doc(vehicleId).update({
      renewalHistory: updatedHistory,
    });

    return NextResponse.json({
      success: true,
      id: `record_${Date.now()}`,
      message: "Renewal record added successfully",
    });
  } catch (error: any) {
    console.error("Error adding renewal record:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add renewal record" },
      { status: 500 }
    );
  }
}
