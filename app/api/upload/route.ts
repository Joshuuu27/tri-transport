import { NextResponse } from "next/server";

function createErrorResponse(error: any, context: string = "") {
  let message = "Unknown error";
  let errorCode = "UNKNOWN";
  
  try {
    if (error instanceof Error) {
      message = error.message;
      errorCode = (error as any).code || "ERROR";
    } else if (typeof error === "string") {
      message = error;
    } else if (error?.message) {
      message = String(error.message);
      errorCode = error?.code || error?.status || "ERROR";
    } else if (error?.error) {
      message = String(error.error);
    } else {
      message = String(error);
    }
  } catch (e) {
    message = "Error parsing error object";
  }

  const errorObj = {
    error: message || "Unknown error",
    context: context || "NO_CONTEXT",
    code: errorCode,
    timestamp: new Date().toISOString(),
  };

  console.error(`[${context}]`, {
    message,
    code: errorCode,
    fullError: error,
    errorObj,
  });

  // Ensure we always return valid JSON with explicit headers
  try {
    return NextResponse.json(errorObj, { 
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store",
      },
    });
  } catch (jsonError) {
    console.error("[FATAL] Could not create JSON response:", jsonError);
    const fallbackResponse = JSON.stringify({
      error: message,
      context: context,
      code: errorCode,
    });
    return new NextResponse(fallbackResponse, {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store",
      },
    });
  }
}

export async function POST(req: Request) {
  // Wrap entire handler in try-catch to ensure we always return something
  try {
    return await handleUpload(req);
  } catch (unexpectedError: any) {
    console.error("[UPLOAD] FATAL: Uncaught error in POST handler:", unexpectedError);
    return createErrorResponse(unexpectedError, "FATAL_UNCAUGHT");
  }
}

async function handleUpload(req: Request) {
  try {
    console.log("[UPLOAD] Starting upload request");

    // Check environment variables first
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    const envCheck = {
      hasProjectId: !!projectId,
      hasStorageBucket: !!storageBucket,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    };

    console.log("[UPLOAD] Environment check:", envCheck);

    if (!storageBucket) {
      return createErrorResponse("Storage bucket not configured", "ENV_CHECK");
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (e) {
      return createErrorResponse(e, "FORM_DATA_PARSE");
    }

    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "general";

    console.log("[UPLOAD] Upload request received:", { fileName: file?.name, type, fileSize: file?.size });

    if (!file) {
      return createErrorResponse("No file provided", "FILE_CHECK");
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return createErrorResponse("File must be an image", "FILE_TYPE_CHECK");
    }

    // Convert file to buffer
    let buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      console.log("[UPLOAD] File converted to buffer, size:", buffer.length);
    } catch (e) {
      return createErrorResponse(e, "BUFFER_CONVERSION");
    }

    // Dynamically import firebase admin to ensure it's initialized after all env vars are loaded
    let firebaseAdmin: any;
    try {
      console.log("[UPLOAD] Importing Firebase admin...");
      const module = await import("@/lib/firebase.admin");
      firebaseAdmin = module.firebaseAdmin;
      console.log("[UPLOAD] Firebase admin imported successfully");
    } catch (importError: any) {
      return createErrorResponse(importError, "FIREBASE_IMPORT");
    }

    if (!firebaseAdmin) {
      return createErrorResponse("Firebase admin is null", "FIREBASE_NULL");
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${type}/${timestamp}-${file.name}`;

    // Get storage bucket
    let bucket;
    try {
      console.log("[UPLOAD] Getting storage bucket...");
      let storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
      console.log("[UPLOAD] Storage bucket from env:", storageBucket);
      
      if (!storageBucket) {
        throw new Error("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET not set");
      }
      
      // Extract just the bucket name (remove .firebasestorage.app if present)
      if (storageBucket.includes(".firebasestorage.app")) {
        storageBucket = storageBucket.replace(".firebasestorage.app", ".appspot.com");
        console.log("[UPLOAD] Converted bucket name to:", storageBucket);
      }
      
      bucket = firebaseAdmin.storage().bucket(storageBucket);
      console.log("[UPLOAD] Storage bucket obtained:", storageBucket);
    } catch (bucketError: any) {
      return createErrorResponse(bucketError, "STORAGE_BUCKET");
    }

    const fileRef = bucket.file(`complaints/${filename}`);
    console.log("[UPLOAD] File reference created:", filename);

    // Upload to Firebase Storage
    try {
      console.log("[UPLOAD] Saving file to Firebase Storage...");
      console.log("[UPLOAD] File details:", {
        name: filename,
        size: buffer.length,
        type: file.type,
      });
      
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type,
        },
      });
      
      console.log("[UPLOAD] File saved to Firebase Storage successfully");
    } catch (saveError: any) {
      console.error("[UPLOAD] File save error details:", {
        errorMessage: saveError.message,
        errorCode: saveError.code,
        errorStatus: saveError.status,
        fullError: saveError,
      });
      return createErrorResponse(saveError, "FILE_SAVE");
    }

    // Get download URL with a longer expiration
    let downloadURL;
    try {
      console.log("[UPLOAD] Generating signed URL...");
      downloadURL = await fileRef.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      console.log("[UPLOAD] Download URL generated successfully");
    } catch (urlError: any) {
      return createErrorResponse(urlError, "URL_GENERATION");
    }

    console.log("[UPLOAD] Upload completed successfully");
    const response = {
      success: true,
      url: downloadURL[0],
      filename: fileRef.name,
    };
    console.log("[UPLOAD] Returning successful response:", response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("[UPLOAD] Unexpected error caught:", error);
    const response = createErrorResponse(error, "UNKNOWN");
    console.log("[UPLOAD] Returning error response");
    return response;
  }
}

