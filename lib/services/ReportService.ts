import { db } from "@/lib/firebase.browser";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";

export interface ReportCase {
  id: string;
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  reportType: string;
  description: string;
  driverId?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  location?: string;
  incidentDate?: Date;
  createdAt: Date;
  status: "pending" | "resolved" | "investigating";
}

export interface ReportCaseInput {
  commuterId: string;
  commuterName: string;
  commuterEmail: string;
  phoneNumber?: string;
  reportType: string;
  description: string;
  driverId?: string;
  vehicleNumber?: string;
  plateNumber?: string;
  location?: string;
  incidentDate?: Date;
}

const REPORTS_COLLECTION = "reports";

/**
 * Submit a new report case from a commuter
 */
export async function submitReportCase(
  reportData: ReportCaseInput
): Promise<string> {
  try {
    // Filter out undefined values and prepare data
    const dataToSave: Record<string, unknown> = {};
    Object.entries(reportData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        dataToSave[key] = value;
      }
    });

    // Handle incidentDate separately
    if (reportData.incidentDate) {
      dataToSave.incidentDate = Timestamp.fromDate(reportData.incidentDate);
    }

    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
      ...dataToSave,
      createdAt: Timestamp.now(),
      status: "pending",
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting report case:", error);
    throw new Error("Failed to submit report case");
  }
}

/**
 * Get all report cases for a specific commuter
 */
export async function getCommuterReportHistory(
  commuterId: string
): Promise<ReportCase[]> {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where("commuterId", "==", commuterId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const reports: ReportCase[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        reportType: data.reportType,
        description: data.description,
        driverId: data.driverId,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        location: data.location,
        incidentDate: data.incidentDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || "pending",
      });
    });

    return reports;
  } catch (error) {
    console.error("Error fetching report history:", error);
    throw new Error("Failed to fetch report history");
  }
}

/**
 * Get all report cases (admin view)
 */
export async function getAllReportCases(): Promise<ReportCase[]> {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const reports: ReportCase[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        commuterId: data.commuterId,
        commuterName: data.commuterName,
        commuterEmail: data.commuterEmail,
        phoneNumber: data.phoneNumber,
        reportType: data.reportType,
        description: data.description,
        driverId: data.driverId,
        vehicleNumber: data.vehicleNumber,
        plateNumber: data.plateNumber,
        location: data.location,
        incidentDate: data.incidentDate?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || "pending",
      });
    });

    return reports;
  } catch (error) {
    console.error("Error fetching all reports:", error);
    throw new Error("Failed to fetch reports");
  }
}

/**
 * Update the status of a report case
 */
export async function updateReportStatus(
  reportId: string,
  status: "pending" | "investigating" | "resolved"
): Promise<void> {
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, reportId);
    await updateDoc(reportRef, { status });
  } catch (error) {
    console.error("Error updating report status:", error);
    throw new Error("Failed to update report status");
  }
}
