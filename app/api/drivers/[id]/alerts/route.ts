import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: driverId } = await params;

  try {
    const commendations: any[] = [];
    const reports: any[] = [];
    const sosAlerts: any[] = [];

    // Helper function to process documents
    const processData = (docs: any[]) => {
      return docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
        }))
        .sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return dateB - dateA; // Sort descending (most recent first)
        });
    };

    // Fetch commendations
    try {
      const commendationsSnapshot = await db
        .collection("commendations")
        .where("driverId", "==", driverId)
        .get();
      commendations.push(...processData(commendationsSnapshot.docs));
    } catch (err: any) {
      console.warn("Error fetching commendations:", err.message);
      // Continue with empty array
    }

    // Fetch reports
    try {
      const reportsSnapshot = await db
        .collection("reports")
        .where("driverId", "==", driverId)
        .get();
      reports.push(...processData(reportsSnapshot.docs));
    } catch (err: any) {
      console.warn("Error fetching reports:", err.message);
      // Continue with empty array
    }

    // Fetch SOS alerts
    try {
      const sosAlertsSnapshot = await db
        .collection("sos_alerts")
        .where("driverId", "==", driverId)
        .get();
      sosAlerts.push(...processData(sosAlertsSnapshot.docs));
    } catch (err: any) {
      console.warn("Error fetching SOS alerts:", err.message);
      // Continue with empty array
    }

    return NextResponse.json({
      commendations,
      reports,
      sosAlerts,
    });
  } catch (error: any) {
    console.error("Error in driver alerts endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch driver alerts" },
      { status: 500 }
    );
  }
}
