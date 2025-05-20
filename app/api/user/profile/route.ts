import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Schema for user creation
const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  role: z.enum(["USER"]).default("USER"),
});

function generateNaijaRailsId() {
  const prefix = "NR";
  const randomNum = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, "0");
  return `${prefix}${randomNum}`;
}

// GET: Get all users (admin only in the future)
export async function GET(request: any) {
  try {
    await connectDB();

    // Ensure authentication (will implement admin check in the future)
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Find users with pagination
    const users = await User.find({})
      .select("-password")
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalUsers = await User.countDocuments({});

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        naijaRailsId: user.naijaRailsId,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      })),
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST: Create a new user
export async function POST(request: any) {
  try {
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      password: hashedPassword,
      name: validatedData.name,
      phone: validatedData.phone || "",
      role: validatedData.role,
      naijaRailsId: generateNaijaRailsId(),
      isVerified: false,
    });

    // Return created user without password
    const createdUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      naijaRailsId: user.naijaRailsId,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
    };

    return NextResponse.json(createdUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
} 