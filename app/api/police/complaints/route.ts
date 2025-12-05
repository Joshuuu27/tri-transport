import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";
import { DocumentSnapshot } from "firebase-admin/firestore";

interface Report {
  id: string;
  driverId?: string;
  [key: string]: any;
}

interface EnrichedReport extends Report {
  driverName?: string;
}

export async function GET(request: Request) {
  try {
    // Fetch all reports from Firestore
    const reportsSnapshot = await db.collection("reports").orderBy("createdAt", "desc").get();
    
    const reports: Report[] = [];
    reportsSnapshot.forEach((doc: DocumentSnapshot) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate?.() || new Date(),
        incidentDate: data?.incidentDate?.toDate?.() || null,
      });
    });

    // Enrich reports with driver names from users collection
    const enrichedReports: EnrichedReport[] = await Promise.all(
      reports.map(async (report) => {
        let driverName = "";
        
        if (report.driverId) {
          try {
            const driverDoc = await db.collection("users").doc(report.driverId).get();
            if (driverDoc.exists) {
              const driverData = driverDoc.data();
              driverName = driverData?.name || driverData?.displayName || "";
            }
          } catch (error) {
            console.error(`Error fetching driver ${report.driverId}:`, error);
          }
        }

        return {
          ...report,
          driverName,
        };
      })
    );

    return NextResponse.json(enrichedReports);
  } catch (error) {
    console.error("Error fetching reports with driver names:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
