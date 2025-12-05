import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

// Cache reports for better performance
const reportCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = params.id;

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = reportCache.get(reportId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    const reportDoc = await db.collection("reports").doc(reportId).get();

    if (!reportDoc.exists) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    const reportData = reportDoc.data();
    const response = {
      id: reportId,
      ...reportData,
      createdAt: reportData.createdAt?.toDate?.() || new Date(),
      incidentDate: reportData.incidentDate?.toDate?.() || null,
    };

    // Cache the result
    reportCache.set(reportId, { data: response, timestamp: Date.now() });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching report:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
