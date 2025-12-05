import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";
import { DocumentSnapshot } from "firebase-admin/firestore";

export async function GET(request: Request) {
  try {
    // Fetch all SOS alerts from Firestore (collection is 'sos_alerts')
    const alertsSnapshot = await db.collection("sos_alerts").orderBy("timestamp", "desc").get();
    
    const alerts: any[] = [];
    alertsSnapshot.forEach((doc: DocumentSnapshot) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        ...data,
        timestamp: data?.timestamp?.toDate?.() || new Date(),
      });
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Error fetching SOS alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch SOS alerts" },
      { status: 500 }
    );
  }
}
