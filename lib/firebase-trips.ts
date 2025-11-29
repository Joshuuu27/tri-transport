import { db, firebaseAuth } from "./firebase.browser";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

export interface Trip {
  id: string;
  userId: string;
  fromAddress: string;
  fromCoords?: { lat: number; lng: number };
  toAddress: string;
  toCoords?: { lat: number; lng: number };
  fare: number | null;
  status: "ongoing" | "completed" | "cancelled";
  createdAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
  startedAt: number;
  duration?: string;
  distance?: string;
}

const tripsCollection = collection(db, "trips");

/**
 * Save a new trip when tracking starts
 * @param fromAddress Display name/address of starting point
 * @param fromCoords Coordinates of starting point {lat, lng}
 * @param toAddress Display name/address of destination
 * @param toCoords Coordinates of destination {lat, lng}
 * @param fare Calculated fare
 */
export async function saveTrip(
  fromAddress: string,
  fromCoords: { lat: number; lng: number } | null,
  toAddress: string,
  toCoords: { lat: number; lng: number } | null,
  fare: number | null
): Promise<string> {
  try {
    const userId = firebaseAuth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const docRef = await addDoc(tripsCollection, {
      userId,
      fromAddress,
      fromCoords: fromCoords || null,
      toAddress,
      toCoords: toCoords || null,
      fare: fare ?? null,
      status: "ongoing",
      createdAt: serverTimestamp(),
      startedAt: Date.now(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error saving trip:", error);
    throw error;
  }
}

/**
 * Mark a trip as completed when tracking stops
 */
export async function completeTrip(tripId: string): Promise<void> {
  try {
    const tripDocRef = doc(tripsCollection, tripId);
    const tripSnap = await getDocs(
      query(tripsCollection, where("__name__", "==", tripId))
    );

    if (tripSnap.empty) {
      console.error("Trip not found:", tripId);
      return;
    }

    const tripData = tripSnap.docs[0].data() as any;
    const startedAt = tripData.startedAt || Date.now();
    const durMs = Date.now() - startedAt;
    const duration = Math.round(durMs / 60000) + " minutes";

    await updateDoc(tripDocRef, {
      status: "completed",
      completedAt: serverTimestamp(),
      duration,
    });
  } catch (error) {
    console.error("Error completing trip:", error);
    throw error;
  }
}

/**
 * Get all trips for the current user
 */
export async function getUserTrips(): Promise<Trip[]> {
  try {
    const userId = firebaseAuth.currentUser?.uid;
    if (!userId) {
      throw new Error("User not authenticated");
    }

    const q = query(tripsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const trips = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as Trip));

    // Sort by createdAt descending (most recent first)
    return trips.sort((a, b) => {
      const aTime = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : (a.createdAt as any).getTime?.() ?? 0;
      const bTime = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : (b.createdAt as any).getTime?.() ?? 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("Error fetching user trips:", error);
    throw error;
  }
}
