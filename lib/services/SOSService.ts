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

export interface SOSAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  latitude: number;
  longitude: number;
  address?: string;
  driverId?: string;
  driverName?: string;
  vehicleType?: string;
  plateNumber?: string;
  licenseNumber?: string;
  timestamp: Date;
  status: "active" | "resolved" | "cancelled";
}

export interface SOSAlertInput {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  latitude: number;
  longitude: number;
  address?: string;
  driverId?: string;
  driverName?: string;
  vehicleType?: string;
  plateNumber?: string;
  licenseNumber?: string;
}

const SOS_COLLECTION = "sos_alerts";

/**
 * Create a new SOS alert
 */
export async function createSOSAlert(sosData: SOSAlertInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, SOS_COLLECTION), {
      ...sosData,
      timestamp: Timestamp.now(),
      status: "active",
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating SOS alert:", error);
    throw new Error("Failed to create SOS alert");
  }
}

/**
 * Get all active SOS alerts (for police)
 */
export async function getAllActiveSOSAlerts(): Promise<SOSAlert[]> {
  try {
    const q = query(
      collection(db, SOS_COLLECTION),
      where("status", "==", "active"),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const alerts: SOSAlert[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        licenseNumber: data.licenseNumber,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status || "active",
      });
    });

    return alerts;
  } catch (error) {
    console.error("Error fetching SOS alerts:", error);
    throw new Error("Failed to fetch SOS alerts");
  }
}

/**
 * Get all SOS alerts for a specific user
 */
export async function getUserSOSAlerts(userId: string): Promise<SOSAlert[]> {
  try {
    const q = query(
      collection(db, SOS_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const alerts: SOSAlert[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      alerts.push({
        id: doc.id,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        userPhone: data.userPhone,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        driverId: data.driverId,
        driverName: data.driverName,
        vehicleType: data.vehicleType,
        plateNumber: data.plateNumber,
        licenseNumber: data.licenseNumber,
        timestamp: data.timestamp?.toDate() || new Date(),
        status: data.status || "active",
      });
    });

    return alerts;
  } catch (error) {
    console.error("Error fetching user SOS alerts:", error);
    throw new Error("Failed to fetch user SOS alerts");
  }
}

/**
 * Update SOS alert status
 */
export async function updateSOSAlertStatus(
  alertId: string,
  status: "active" | "resolved" | "cancelled"
): Promise<void> {
  try {
    const { doc, updateDoc } = await import("firebase/firestore");
    const alertRef = doc(db, SOS_COLLECTION, alertId);
    await updateDoc(alertRef, { status });
  } catch (error) {
    console.error("Error updating SOS alert status:", error);
    throw new Error("Failed to update SOS alert status");
  }
}
