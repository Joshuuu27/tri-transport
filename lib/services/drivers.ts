import { db } from "@/lib/firebase.admin";

export async function index() {
    const snap = await db
    .collection("users")
    .where("role", "==", "driver")
    .get();


  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
