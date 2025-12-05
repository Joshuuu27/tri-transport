import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("[TEST] Testing Firebase connection...");

    // Test environment variables
    const envCheck = {
      hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      projectId: process.env.FIREBASE_PROJECT_ID || "NOT SET",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "NOT SET",
    };

    console.log("[TEST] Environment check:", envCheck);

    // Try to import Firebase Admin
    let firebaseAdmin: any = null;
    try {
      const { firebaseAdmin: admin } = await import("@/lib/firebase.admin");
      firebaseAdmin = admin;
      console.log("[TEST] Firebase admin imported successfully");
    } catch (importError: any) {
      console.error("[TEST] Failed to import Firebase admin:", importError);
      return NextResponse.json(
        {
          status: "error",
          message: "Firebase import failed",
          error: importError.message,
          envCheck,
        },
        { status: 500 }
      );
    }

    if (!firebaseAdmin) {
      console.error("[TEST] Firebase admin is null");
      return NextResponse.json(
        {
          status: "error",
          message: "Firebase admin is null",
          envCheck,
        },
        { status: 500 }
      );
    }

    // Try to get storage bucket
    let bucket;
    try {
      console.log("[TEST] Getting storage bucket...");
      let storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      console.log("[TEST] Storage bucket from env:", storageBucket);
      
      if (!storageBucket) {
        throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not set");
      }
      
      // Extract just the bucket name (remove .firebasestorage.app if present)
      if (storageBucket.includes(".firebasestorage.app")) {
        storageBucket = storageBucket.replace(".firebasestorage.app", ".appspot.com");
        console.log("[TEST] Converted bucket name to:", storageBucket);
      }
      
      bucket = firebaseAdmin.storage().bucket(storageBucket);
      console.log("[TEST] Storage bucket obtained successfully:", storageBucket);
    } catch (bucketError: any) {
      console.error("[TEST] Failed to get storage bucket:", bucketError);
      return NextResponse.json(
        {
          status: "error",
          message: "Storage bucket error",
          error: bucketError.message,
          envCheck,
        },
        { status: 500 }
      );
    }

    // Try to test file operations
    let testFileInfo = {};
    try {
      console.log("[TEST] Testing file operations...");
      const testFile = bucket.file("test/.gitkeep");
      console.log("[TEST] Test file reference created");
      
      // Try to get metadata (non-destructive test)
      try {
        const [metadata] = await testFile.getMetadata();
        testFileInfo = { exists: true, metadata };
        console.log("[TEST] Test file metadata retrieved");
      } catch (metadataError: any) {
        if (metadataError.code === 404) {
          testFileInfo = { exists: false, code: "NOT_FOUND" };
          console.log("[TEST] Test file does not exist (expected)");
        } else {
          throw metadataError;
        }
      }
    } catch (fileError: any) {
      console.error("[TEST] File operation test failed:", fileError);
      testFileInfo = { error: fileError.message };
    }

    console.log("[TEST] Firebase connection successful");
    return NextResponse.json({
      status: "success",
      message: "Firebase is properly configured",
      envCheck,
      bucketName: bucket.name,
      testFileInfo,
    });
  } catch (error: any) {
    console.error("[TEST] Unexpected error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Unexpected error",
        error: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
