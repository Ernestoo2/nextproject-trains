import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// Generate a unique Naija Rails ID using UUID
function generateNaijaRailsId() {
  return `NR${uuidv4()}`;
}

export async function GET() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Check if test user exists
    const email = "test@example.com";
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`Test user already exists: ${existingUser.email}, ID: ${existingUser._id}`);
      
      return NextResponse.json({
        success: true,
        message: "Test user already exists",
        user: {
          id: existingUser._id.toString(),
          email: existingUser.email,
          name: existingUser.name,
          naijaRailsId: existingUser.naijaRailsId
        }
      });
    }

    // Create a new test user
    const hashedPassword = await bcrypt.hash("password123", 12);
    const naijaRailsId = generateNaijaRailsId();

    const newUser = {
      name: "Test User",
      email,
      password: hashedPassword,
      naijaRailsId,
      phone: "1234567890",
      address: "123 Test Street",
      dob: "1990-01-01",
      role: "USER"
    };

    const createdUser = await User.create(newUser);
    console.log(`Test user created: ${createdUser.email}, ID: ${createdUser._id}`);

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      user: {
        id: createdUser._id.toString(),
        email: createdUser.email,
        name: createdUser.name,
        naijaRailsId: createdUser.naijaRailsId
      }
    });
  } catch (error) {
    console.error("Error creating test user:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
}

// Also provide an endpoint to list all users for debugging
export async function POST() {
  try {
    await connectDB();
    
    // Get all users from the database
    const users = await User.find({}, {
      _id: 1,
      name: 1,
      email: 1,
      naijaRailsId: 1,
      role: 1,
      createdAt: 1
    });
    
    console.log(`Found ${users.length} users in the database`);
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        naijaRailsId: user.naijaRailsId,
        role: user.role,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error("Error listing users:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    
    return NextResponse.json({
      success: false,
      message: errorMessage
    }, { status: 500 });
  }
} 