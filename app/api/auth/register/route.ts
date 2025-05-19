import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";
import { v4 as uuidv4 } from "uuid"; // For robust unique ID generation

// Generate a unique Naija Rails ID using UUID
function generateNaijaRailsId() {
  return `NR${uuidv4()}`;
}

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 },
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 },
      );
    }

    // Generate unique identifier
    const naijaRailsId = generateNaijaRailsId();
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user document
    const newUser = {
      name,
      email,
      password: hashedPassword,
      naijaRailsId,
      phone: phone || "",
      address: "",
      dob: "",
      role: "USER",
    };

    // Save to database
    const createdUser = await User.create(newUser);

    // Return success without sensitive data
    return NextResponse.json({
      success: true,
      message: "Registration successful! You can now log in.",
      user: {
        id: createdUser._id.toString(),
        name: createdUser.name,
        email: createdUser.email,
        naijaRailsId: createdUser.naijaRailsId
      }
    });
  } catch (error) {
    console.error("[REGISTER_API_ERROR]:", error);
    
    // Check for MongoDB errors
    if (error instanceof Error && error.message.includes("duplicate key error")) {
        return NextResponse.json(
            { success: false, error: "A user with this identifier already exists." },
            { status: 409 }
        );
    }

    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again later." },
      { status: 500 },
    );
  }
}
