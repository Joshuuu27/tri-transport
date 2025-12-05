import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[DEBUG-UPLOAD] Starting diagnostic...");

    // Check environment variables
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    const envVars = {
      FIREBASE_PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
      FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
      FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: !!storageBucket,
      STORAGE_BUCKET_VALUE: storageBucket || "NOT SET",
    };

    console.log("[DEBUG-UPLOAD] Env check:", envVars);

    // Try to import Firebase admin
    let firebaseAdmin: any = null;
    let firebaseError = null;

    try {
      const module = await import("@/lib/firebase.admin");
      firebaseAdmin = module.firebaseAdmin;
      console.log("[DEBUG-UPLOAD] Firebase admin imported successfully");
    } catch (err: any) {
      firebaseError = err.message;
      console.error("[DEBUG-UPLOAD] Firebase import error:", err.message);
    }

    // Try to access storage bucket
    let bucketError = null;
    let bucketAccess = null;

    if (firebaseAdmin && storageBucket) {
      try {
        console.log("[DEBUG-UPLOAD] Attempting to access bucket:", storageBucket);
        const bucket = firebaseAdmin.storage().bucket(storageBucket);
        
        // Try to list files to verify access
        const [files] = await bucket.getFiles({ maxResults: 1 });
        bucketAccess = {
          status: "Successfully accessed bucket",
          bucketName: storageBucket,
          filesCount: files.length,
        };
        console.log("[DEBUG-UPLOAD] Bucket access successful");
      } catch (err: any) {
        bucketError = {
          message: err.message,
          code: err.code,
          fullError: err.toString(),
        };
        console.error("[DEBUG-UPLOAD] Bucket access error:", err.message);
      }
    }

    return NextResponse.json({
      status: "diagnostic",
      environment: envVars,
      firebaseStatus: firebaseError ? { error: firebaseError } : { status: "ok" },
      bucketStatus: bucketError ? { error: bucketError } : bucketAccess,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[DEBUG-UPLOAD] Unexpected error:", err);
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
