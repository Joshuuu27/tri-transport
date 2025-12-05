import admin, { ServiceAccount } from "firebase-admin";

let cachedFirebaseAdmin: any = null;

export function getFirebaseAdmin() {
  if (cachedFirebaseAdmin) {
    return cachedFirebaseAdmin;
  }

  if (!admin.apps.length) {
    try {
      // Get private key from environment - handle different formats
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      if (!privateKey) {
        throw new Error("FIREBASE_PRIVATE_KEY is not set");
      }

      // Handle escaped newlines: "\\n" -> "\n"
      privateKey = privateKey.replace(/\\n/g, '\n');

      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      };

      console.log("[FIREBASE_ADMIN] Service account config:", {
        hasProjectId: !!serviceAccount.projectId,
        hasClientEmail: !!serviceAccount.clientEmail,
        hasPrivateKey: !!serviceAccount.privateKey,
        projectId: serviceAccount.projectId,
        clientEmail: serviceAccount.clientEmail,
      });

      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error("Missing required Firebase credentials");
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("[FIREBASE_ADMIN] Firebase admin initialized successfully");
    } catch (error) {
      console.error("[FIREBASE_ADMIN] Failed to initialize Firebase admin:", error);
      throw error;
    }
  }

  cachedFirebaseAdmin = admin;
  return cachedFirebaseAdmin;
}

let firebaseAdmin: any = null;
let db: any = null;
let adminAuth: any = null;
let usersCollection: any = null;

try {
  firebaseAdmin = getFirebaseAdmin();
  db = firebaseAdmin.firestore();
  usersCollection = db.collection("users");
  adminAuth = firebaseAdmin.auth();
} catch (error) {
  console.error("[FIREBASE_ADMIN] Error setting up Firebase services:", error);
}

export { firebaseAdmin, db, adminAuth, usersCollection };