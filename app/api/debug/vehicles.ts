import { NextResponse } from "next/server";
import { db } from "@/lib/firebase.admin";

export async function GET(req: Request) {
  try {
    const snapshot = await db.collection("vehicles").limit(3).get();

    const vehicles = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        plateNumber: data.plateNumber,
        franchiseExpirationDate: data.franchiseExpirationDate,
        renewalHistory: data.renewalHistory,
        // Log the raw JSON representation
        rawFranchiseExpiration: JSON.stringify(data.franchiseExpirationDate, null, 2),
        rawRenewalHistory: JSON.stringify(data.renewalHistory, null, 2),
      };
    });

    return NextResponse.json(vehicles, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
