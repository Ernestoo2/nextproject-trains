import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";
import { UserDocument } from "@/types/shared/users";
import bcrypt from "bcryptjs";

function generateNaijaRailsId() {
  const prefix = "NR";
  const randomNum = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, "0");
  return `${prefix}${randomNum}`;
}

// GET: List all users (no auth required for testing)
export async function GET() {
  try {
    await connectDB();
    
    // Direct DB query to find users
    const users = await User.find().lean() as unknown as UserDocument[];
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        naijaRailsId: user.naijaRailsId,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// POST: Create test user (no auth required for testing)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, password } = body;
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user with minimal required fields
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: "USER",
      naijaRailsId: generateNaijaRailsId(),
      isVerified: false,
    });
    
    // Return user without password
    const userWithoutPassword = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      naijaRailsId: user.naijaRailsId,
      createdAt: user.createdAt
    };
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 