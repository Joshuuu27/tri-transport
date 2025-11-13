import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "7d"; // token validity

// Hash password
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// Verify password against hash
export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

// Compare password (alias for verifyPassword)
export async function comparePassword(password: string, hashedPassword: string) {
  return await verifyPassword(password, hashedPassword);
}

// Generate JWT
export function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (err){
     console.error("JWT verification failed:", err);
    return null;
  }
}
