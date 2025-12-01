import { db } from "@/lib/firebase.browser";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

export interface DriverLicense {
  id: string;
  driverId: string;
  licenseNumber: string;
  expiryDate?: Date;
  issueDate?: Date;
  updatedAt: Date;
}

export interface DriverLicenseInput {
  driverId: string;
  licenseNumber: string;
  expiryDate?: Date;
  issueDate?: Date;
}

const DRIVER_LICENSES_COLLECTION = "driverLicenses";

/**
 * Add or update driver license information
 */
export async function setDriverLicense(
  licenseData: DriverLicenseInput
): Promise<string> {
  try {
    const docRef = doc(db, DRIVER_LICENSES_COLLECTION, licenseData.driverId);

    const dataToSave: Record<string, unknown> = {
      driverId: licenseData.driverId,
      licenseNumber: licenseData.licenseNumber,
      updatedAt: Timestamp.now(),
    };

    if (licenseData.expiryDate) {
      dataToSave.expiryDate = Timestamp.fromDate(licenseData.expiryDate);
    }

    if (licenseData.issueDate) {
      dataToSave.issueDate = Timestamp.fromDate(licenseData.issueDate);
    }

    await setDoc(docRef, dataToSave, { merge: true });
    return licenseData.driverId;
  } catch (error) {
    console.error("Error setting driver license:", error);
    throw new Error("Failed to set driver license");
  }
}

/**
 * Get driver license information
 */
export async function getDriverLicense(
  driverId: string
): Promise<DriverLicense | null> {
  try {
    const docRef = doc(db, DRIVER_LICENSES_COLLECTION, driverId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      driverId: data.driverId,
      licenseNumber: data.licenseNumber,
      expiryDate: data.expiryDate?.toDate(),
      issueDate: data.issueDate?.toDate(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error fetching driver license:", error);
    throw new Error("Failed to fetch driver license");
  }
}

/**
 * Update driver license information
 */
export async function updateDriverLicense(
  driverId: string,
  updates: Partial<DriverLicenseInput>
): Promise<void> {
  try {
    const docRef = doc(db, DRIVER_LICENSES_COLLECTION, driverId);

    const dataToUpdate: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    if (updates.licenseNumber) {
      dataToUpdate.licenseNumber = updates.licenseNumber;
    }

    if (updates.expiryDate) {
      dataToUpdate.expiryDate = Timestamp.fromDate(updates.expiryDate);
    }

    if (updates.issueDate) {
      dataToUpdate.issueDate = Timestamp.fromDate(updates.issueDate);
    }

    await updateDoc(docRef, dataToUpdate);
  } catch (error) {
    console.error("Error updating driver license:", error);
    throw new Error("Failed to update driver license");
  }
}

/**
 * Delete driver license information
 */
export async function deleteDriverLicense(driverId: string): Promise<void> {
  try {
    const docRef = doc(db, DRIVER_LICENSES_COLLECTION, driverId);
    // Instead of deleting, we set all fields to empty
    await setDoc(
      docRef,
      {
        licenseNumber: "",
        expiryDate: null,
        issueDate: null,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error deleting driver license:", error);
    throw new Error("Failed to delete driver license");
  }
}
