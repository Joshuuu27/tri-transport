import { NextResponse } from "next/server";
import { db, firebaseAdmin } from "@/lib/firebase.admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: operatorId } = await params;

  try {
    // Fetch all vehicles where operatorId matches
    const snapshot = await db
      .collection("vehicles")
      .where("operatorId", "==", operatorId)
      .get();

    const vehicles = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Add missing dateAdded and franchiseExpirationDate for legacy vehicles
      let dateAdded = data.dateAdded;
      let franchiseExpirationDate = data.franchiseExpirationDate;
      let renewalHistory = data.renewalHistory;
      let needsUpdate = false;
      
      if (!dateAdded) {
        needsUpdate = true;
        // Get the actual date value
        const actualDateAdded = data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt) : new Date();
        dateAdded = firebaseAdmin.firestore.Timestamp.fromDate(actualDateAdded);
        
        const franchiseExpDate = new Date(actualDateAdded);
        franchiseExpDate.setFullYear(franchiseExpDate.getFullYear() + 1);
        franchiseExpirationDate = firebaseAdmin.firestore.Timestamp.fromDate(franchiseExpDate);
        
        renewalHistory = [
          {
            renewalDate: dateAdded,
            expirationDate: franchiseExpirationDate,
            type: "initial_registration",
            remarks: "Initial vehicle registration",
          },
        ];
        
        // Update Firestore with these fields (async, don't block the response)
        if (needsUpdate) {
          doc.ref.update({
            dateAdded: dateAdded,
            franchiseExpirationDate: franchiseExpirationDate,
            renewalHistory: renewalHistory,
          }).catch(err => console.error("Error updating vehicle:", err));
        }
      }
      
      // Convert renewal history timestamps safely
      let convertedRenewalHistory: any[] = [];
      try {
        convertedRenewalHistory = (renewalHistory || []).map((entry: any) => {
          let renewalDateStr = null;
          let expirationDateStr = null;
          
          try {
            if (entry.renewalDate) {
              const renewalDateObj = entry.renewalDate.toDate ? entry.renewalDate.toDate() : new Date(entry.renewalDate);
              if (!isNaN(renewalDateObj.getTime())) {
                renewalDateStr = renewalDateObj.toISOString();
              }
            }
          } catch (e) {
            console.error("Error converting renewalDate:", e);
          }
          
          try {
            if (entry.expirationDate) {
              const expirationDateObj = entry.expirationDate.toDate ? entry.expirationDate.toDate() : new Date(entry.expirationDate);
              if (!isNaN(expirationDateObj.getTime())) {
                expirationDateStr = expirationDateObj.toISOString();
              }
            }
          } catch (e) {
            console.error("Error converting expirationDate:", e);
          }
          
          return {
            renewalDate: renewalDateStr,
            expirationDate: expirationDateStr,
            type: entry.type || "renewal",
            remarks: entry.remarks || "",
          };
        });
      } catch (e) {
        console.error("Error converting renewal history:", e);
        convertedRenewalHistory = [];
      }
      
      // Convert main dateAdded safely
      let dateAddedStr = null;
      try {
        if (dateAdded) {
          const dateAddedObj = dateAdded.toDate ? dateAdded.toDate() : new Date(dateAdded);
          if (!isNaN(dateAddedObj.getTime())) {
            dateAddedStr = dateAddedObj.toISOString();
          }
        }
      } catch (e) {
        console.error("Error converting dateAdded:", e);
      }
      
      // Convert franchiseExpirationDate safely
      let franchiseExpirationDateStr = null;
      try {
        if (franchiseExpirationDate) {
          const franchiseExpObj = franchiseExpirationDate.toDate ? franchiseExpirationDate.toDate() : new Date(franchiseExpirationDate);
          if (!isNaN(franchiseExpObj.getTime())) {
            franchiseExpirationDateStr = franchiseExpObj.toISOString();
          }
        }
      } catch (e) {
        console.error("Error converting franchiseExpirationDate:", e);
      }
      
      return {
        id: doc.id,
        plateNumber: data.plateNumber || "",
        vehicleType: data.vehicleType || "",
        ...data,
        // Convert Firestore Timestamps to ISO strings for JSON serialization
        dateAdded: dateAddedStr,
        franchiseExpirationDate: franchiseExpirationDateStr,
        renewalHistory: convertedRenewalHistory,
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : new Date(data.createdAt).toISOString()) : null,
        updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : new Date(data.updatedAt).toISOString()) : null,
      };
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
