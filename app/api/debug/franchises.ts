import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

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

export async function GET(req: Request) {
  try {
    const snapshot = await db.collection("vehicles").get();
    const now = new Date();

    const franchises = snapshot.docs.map((doc) => {
      const vehicle = doc.data();
      let expiryDateObj: any = null;
      let expiryDateFormatted = "N/A";
      let status = "unknown";
      let source = "none";

      if (vehicle.franchiseExpirationDate) {
        source = "franchiseExpirationDate field";
        try {
          expiryDateObj = parseFirestoreDate(vehicle.franchiseExpirationDate);
          expiryDateFormatted = expiryDateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          status = expiryDateObj < now ? "expired" : "active";
        } catch (e) {
          source = "franchiseExpirationDate field (ERROR)";
        }
      } else if (vehicle.renewalHistory && vehicle.renewalHistory.length > 0) {
        source = "renewalHistory";
        try {
          const latestRenewal = vehicle.renewalHistory.reduce(
            (latest: any, current: any) => {
              const currentDate = parseFirestoreDate(current.renewalDate);
              const latestDate = parseFirestoreDate(latest.renewalDate);
              return currentDate > latestDate ? current : latest;
            }
          );

          if (latestRenewal.expirationDate) {
            expiryDateObj = parseFirestoreDate(latestRenewal.expirationDate);
            expiryDateFormatted = expiryDateObj.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          } else {
            const renewalDateValue = parseFirestoreDate(latestRenewal.renewalDate);
            expiryDateObj = new Date(renewalDateValue);
            expiryDateObj.setFullYear(expiryDateObj.getFullYear() + 1);
            expiryDateFormatted = expiryDateObj.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          }
          
          status = expiryDateObj < now ? "expired" : "active";
        } catch (e) {
          source = "renewalHistory (ERROR)";
        }
      }

      return {
        plateNumber: vehicle.plateNumber,
        bodyNumber: vehicle.bodyNumber,
        franchiseNumber: vehicle.franchiseNumber,
        expiryDate: expiryDateFormatted,
        expiryDateISO: expiryDateObj?.toISOString() || "N/A",
        status,
        source,
        franchiseExpirationDateRaw: vehicle.franchiseExpirationDate,
        renewalHistoryCount: vehicle.renewalHistory?.length || 0,
        latestRenewalDate: vehicle.renewalHistory?.[0]?.renewalDate || "N/A",
      };
    });

    return NextResponse.json(franchises, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=franchises-debug.json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
