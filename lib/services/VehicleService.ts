import { db } from "@/lib/firebase.browser";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export interface Vehicle {
  id: string;
  driverId: string;
  plateNumber: string;
  bodyNumber: string;
  vehicleType: "Baobao" | "Tricycle" | "Other";
  color: string;
  createdAt: Date;
}

export interface VehicleInput {
  driverId: string;
  plateNumber: string;
  bodyNumber: string;
  vehicleType: "Baobao" | "Tricycle" | "Other";
  color: string;
}

const VEHICLES_COLLECTION = "vehicles";

/**
 * Add a new vehicle for a driver
 */
export async function addVehicle(vehicleData: VehicleInput): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, VEHICLES_COLLECTION), {
      ...vehicleData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding vehicle:", error);
    throw new Error("Failed to add vehicle");
  }
}

/**
 * Get all vehicles for a specific driver
 */
export async function getDriverVehicles(driverId: string): Promise<Vehicle[]> {
  try {
    const q = query(
      collection(db, VEHICLES_COLLECTION),
      where("driverId", "==", driverId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const vehicles: Vehicle[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      vehicles.push({
        id: doc.id,
        driverId: data.driverId,
        plateNumber: data.plateNumber,
        bodyNumber: data.bodyNumber,
        vehicleType: data.vehicleType,
        color: data.color,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    });

    return vehicles;
  } catch (error) {
    console.error("Error fetching driver vehicles:", error);
    throw new Error("Failed to fetch vehicles");
  }
}

/**
 * Update a vehicle
 */
export async function updateVehicle(
  vehicleId: string,
  updates: Partial<VehicleInput>
): Promise<void> {
  try {
    const vehicleRef = doc(db, VEHICLES_COLLECTION, vehicleId);
    await updateDoc(vehicleRef, updates);
  } catch (error) {
    console.error("Error updating vehicle:", error);
    throw new Error("Failed to update vehicle");
  }
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(vehicleId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, VEHICLES_COLLECTION, vehicleId));
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    throw new Error("Failed to delete vehicle");
  }
}
