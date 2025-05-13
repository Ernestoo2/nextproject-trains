import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";

// Generate a unique Naija Rails ID
async function generateUniqueNaijaRailsId() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  const naijaRailsId = `NR${timestamp}${random}`;

  // Check if ID already exists
  const existingUser = await User.findOne({ naijaRailsId });
  if (existingUser) {
    // If exists, try again recursively
    return generateUniqueNaijaRailsId();
  }

  return naijaRailsId;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    // Generate unique Naija Rails ID
    const naijaRailsId = await generateUniqueNaijaRailsId();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with profile
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      naijaRailsId,
      phone: "",
      address: "",
      dob: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Remove password from response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      naijaRailsId: user.naijaRailsId,
      phone: user.phone,
      address: user.address,
      dob: user.dob,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      message: "Registration successful! You can now log in.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
