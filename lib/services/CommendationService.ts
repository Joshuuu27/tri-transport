import { db } from "@/lib/firebase.browser";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
} from "firebase/firestore";

export interface Commendation {
  id: string;
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  driverId: string;
  driverName?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  rating: number;
  comment: string;
  commendationType: string;
  createdAt: Date;
}

export interface CommendationInput {
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  driverId: string;
  driverName?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  rating: number;
  comment: string;
  commendationType: string;
}

const COMMENDATIONS_COLLECTION = "commendations";

/**
 * Submit a new commendation for a driver
 */
export async function submitCommendation(
  commendationData: CommendationInput
): Promise<string> {
  try {
    // Filter out undefined values
    const dataToSave = Object.fromEntries(
      Object.entries(commendationData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await addDoc(collection(db, COMMENDATIONS_COLLECTION), {
      ...dataToSave,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting commendation:", error);
    throw new Error("Failed to submit commendation");
  }
}

/**
 * Get all commendations submitted by a specific commuter
 */
export async function getCommuterCommendations(
  commuterId: string
): Promise<Commendation[]> {
  try {
    const q = query(
      collection(db, COMMENDATIONS_COLLECTION),
      where("commuterId", "==", commuterId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const commendations: Commendation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      commendations.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        rating: data.rating,
        comment: data.comment,
        commendationType: data.commendationType,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return commendations;
  } catch (error) {
    console.error("Error fetching commendations:", error);
    throw new Error("Failed to fetch commendations");
  }
}

/**
 * Get all commendations for a specific driver (admin view)
 */
export async function getDriverCommendations(
  driverId: string
): Promise<Commendation[]> {
  try {
    const q = query(
      collection(db, COMMENDATIONS_COLLECTION),
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const commendations: Commendation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      commendations.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        rating: data.rating,
        comment: data.comment,
        commendationType: data.commendationType,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return commendations;
  } catch (error) {
    console.error("Error fetching driver commendations:", error);
    throw new Error("Failed to fetch commendations");
  }
}

/**
 * Get all commendations (admin view)
 */
export async function getAllCommendations(): Promise<Commendation[]> {
  try {
    const q = query(
      collection(db, COMMENDATIONS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const commendations: Commendation[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      commendations.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        rating: data.rating,
        comment: data.comment,
        commendationType: data.commendationType,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return commendations;
  } catch (error) {
    console.error("Error fetching all commendations:", error);
    throw new Error("Failed to fetch commendations");
  }
}
