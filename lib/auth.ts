"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sign, verify } from 'jsonwebtoken'

// Simple in-memory user store (in production, use a database)
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123", // In production, this should be hashed
}

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key' // Use environment variable in production

export async function login(username: string, password: string) {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const cookieStore = await cookies()
    cookieStore.set("admin-session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
    return { success: true }
  }
  return { success: false, error: "Invalid credentials" }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("admin-session")
  redirect("/login")
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  const session = cookieStore.get("admin-session")
  if (session?.value === "authenticated") {
    // In a real app, we would fetch the user from the database
    // For now, just return a hardcoded admin object
    return { isAuthenticated: true, role: 'admin' }
  }
  return null
}

export async function changePassword(currentPassword: string, newPassword: string) {
  if (currentPassword !== ADMIN_CREDENTIALS.password) {
    return { success: false, error: "Current password is incorrect" }
  }

  // In production, you would update the password in the database
  // For this demo, we'll just return success
  return { success: true }
}

// JWT token verification function
export async function verifyToken(token: string) {
  try {
    // Verify the token using the secret key
    const decoded = verify(token, JWT_SECRET);
    return decoded as { id: string; email: string; role: string };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Generate JWT token
export async function generateToken(payload: any) {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Parse token function for auth/me route
export async function parseToken(token: string) {
  try {
    // In a real app, this would be a JWT verification
    // For simplicity, we'll assume the token format is userId:timestamp
    const [userId, timestamp] = token.split(':');
    
    if (!userId || !timestamp) {
      return null;
    }
    
    return {
      userId,
      timestamp: parseInt(timestamp, 10)
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
}
export interface OrderHistoryFilter {
  username: string;
  startDate: string;
  endDate: string;
  status: string;
}

// Hash password function for user registration and password changes
export async function hashPassword(password: string): Promise<string> {
  // In a real application, you would use a proper hashing library like bcrypt
  // For simplicity, we're using a basic hash function here
  // This should be replaced with proper password hashing in production
  return Buffer.from(password).toString('base64');
}

// Compare password function for login authentication
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  // In a real application, you would use a proper comparison function from bcrypt
  // For simplicity, we're using a basic comparison here
  // This should be replaced with proper password comparison in production
  const hashedInput = await hashPassword(plainPassword);
  return hashedInput === hashedPassword;
}
