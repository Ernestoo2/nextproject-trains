import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../utils/auth/next-auth";
import { User } from "@/utils/mongodb/models/User";
import { connectDB } from "@/utils/mongodb/connect";
import { UserProfile } from "@/utils/type";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    // In Next.js App Router, params is a Promise that needs to be awaited
    const { userId } = await params;

    if (!userId || userId === "undefined") {
      return new NextResponse("User ID is missing or invalid", { status: 400 });
    }

    // Try to find the user by _id
    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Transform to UserProfile type
    const userProfile: UserProfile = {
      id: user._id.toString(), // Convert MongoDB _id to string id
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      dob: user.dob || "",
      role: user.role || "user",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, dob } = body;

    await connectDB();

    // In Next.js App Router, params is a Promise that needs to be awaited
    const { userId } = await params;

    if (!userId || userId === "undefined") {
      return new NextResponse("User ID is missing or invalid", { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (dob) user.dob = dob;

    // Update the updatedAt timestamp
    user.updatedAt = new Date().toISOString();

    // Save the updated user
    await user.save();

    // Transform to UserProfile type for response
    const updatedUserProfile: UserProfile = {
      id: user._id.toString(), // Convert MongoDB _id to string id
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      address: user.address || "",
      dob: user.dob || "",
      role: user.role || "user", // Default role if not specified
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(updatedUserProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
