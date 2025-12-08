import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

// Cache reports for better performance
const reportCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const { status } = await request.json();

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    if (!status || !["pending", "investigating", "resolved"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'pending', 'investigating', or 'resolved'" },
        { status: 400 }
      );
    }

    const reportRef = db.collection("reports").doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    // Update the status
    await reportRef.update({
      status,
      updatedAt: new Date(),
    });

    // Clear cache for this report
    reportCache.delete(reportId);

    return NextResponse.json({
      success: true,
      message: "Report status updated successfully",
      id: reportId,
      status,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}
