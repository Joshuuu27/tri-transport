import admin, { ServiceAccount } from "firebase-admin";
import { getFirestore, collection } from "firebase/firestore";
const serviceAccount: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

// const databaseURL = "https://metatron-blog.firebaseio.com";

export function getFirebaseAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    //   databaseURL,
    });
  }

  return admin;
}

const firebaseAdmin = getFirebaseAdmin();

const db = firebaseAdmin.firestore();

export const usersCollection = db.collection("users");
const adminAuth = firebaseAdmin.auth();

export { firebaseAdmin, db, adminAuth };