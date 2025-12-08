import { NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/lib/firebase.admin";

// Helper function to parse Firestore date in any format
const parseFirestoreDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  if (dateValue.seconds !== undefined) {
    return new Date(dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000);
  }
  
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  if (typeof dateValue === 'number') {
    if (dateValue > 10000000000) {
      return new Date(dateValue);
    } else {
      return new Date(dateValue * 1000);
    }
  }
  
  return new Date();
};

export async function POST(req: Request) {
  try {
    const snapshot = await db.collection("vehicles").get();
    let fixedCount = 0;
    let errors = [];

    for (const doc of snapshot.docs) {
      const vehicle = doc.data();
      let updated = false;
      const updateData: any = {};

      // Fix franchiseExpirationDate
      if (vehicle.franchiseExpirationDate) {
        try {
          const parsedDate = parseFirestoreDate(vehicle.franchiseExpirationDate);
          const firestoreTimestamp = firebaseAdmin.firestore.Timestamp.fromDate(parsedDate);
          updateData.franchiseExpirationDate = firestoreTimestamp;
          updated = true;
        } catch (e) {
          errors.push({
            plateNumber: vehicle.plateNumber,
            field: "franchiseExpirationDate",
            error: String(e),
          });
        }
      }

      // Fix renewalHistory dates
      if (vehicle.renewalHistory && Array.isArray(vehicle.renewalHistory)) {
        const fixedHistory = vehicle.renewalHistory.map((renewal: any) => {
          const fixed: any = { ...renewal };
          
          if (renewal.renewalDate) {
            try {
              const parsedDate = parseFirestoreDate(renewal.renewalDate);
              fixed.renewalDate = firebaseAdmin.firestore.Timestamp.fromDate(parsedDate);
              updated = true;
            } catch (e) {
              errors.push({
                plateNumber: vehicle.plateNumber,
                field: "renewalHistory.renewalDate",
                error: String(e),
              });
            }
          }
          
          if (renewal.expirationDate) {
            try {
              const parsedDate = parseFirestoreDate(renewal.expirationDate);
              fixed.expirationDate = firebaseAdmin.firestore.Timestamp.fromDate(parsedDate);
              updated = true;
            } catch (e) {
              errors.push({
                plateNumber: vehicle.plateNumber,
                field: "renewalHistory.expirationDate",
                error: String(e),
              });
            }
          }
          
          return fixed;
        });
        
        if (updated) {
          updateData.renewalHistory = fixedHistory;
        }
      }

      // Update the document if changes were made
      if (updated && Object.keys(updateData).length > 0) {
        try {
          await doc.ref.update(updateData);
          fixedCount++;
        } catch (e) {
          errors.push({
            plateNumber: vehicle.plateNumber,
            error: `Failed to update: ${String(e)}`,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      fixedCount,
      errors,
      message: `Fixed ${fixedCount} vehicles. ${errors.length} errors occurred.`,
    });
  } catch (error) {
    console.error("Error in fix-franchises:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
