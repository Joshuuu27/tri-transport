import { NextResponse } from "next/server";
import { adminAuth, db, firebaseAdmin } from "@/lib/firebase.admin";
import { SESSION_COOKIE_NAME } from "@/constant";

export async function POST(req: Request) {
  try {
    // Verify the requester is an admin
    const cookieHeader = req.headers.get("cookie") || "";
    const cookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = cookie.split("=")[1];
    const decoded = await firebaseAdmin.auth().verifySessionCookie(token, true);
    
    // Get user role from Firestore
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const role = userDoc.data()?.role;

    if (role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create users" },
        { status: 403 }
      );
    }

    const { email, password, name, userRole } = await req.json();

    if (!email || !password || !name || !userRole) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name, userRole" },
        { status: 400 }
      );
    }

    // Validate role
    const allowedRoles = ["franchising", "cttmo", "police", "police_head", "operator", "driver", "user"];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { error: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if email already exists
    try {
      await adminAuth.getUserByEmail(email);
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    } catch (error: any) {
      // User doesn't exist, which is what we want
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }

    // Special handling for police_head - ensure only one exists
    if (userRole === "police_head") {
      const existingHeads = await db
        .collection("users")
        .where("role", "==", "police_head")
        .get();
      
      if (!existingHeads.empty) {
        return NextResponse.json(
          { error: "A police head already exists. Please reassign the existing police head first." },
          { status: 400 }
        );
      }
    }

    // Create user in Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    // Save user profile to Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      name,
      role: userRole,
      createdAt: Date.now(),
      createdBy: decoded.uid, // Track who created this account
    });

    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: userRole });

    return NextResponse.json({
      success: true,
      uid: userRecord.uid,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}
