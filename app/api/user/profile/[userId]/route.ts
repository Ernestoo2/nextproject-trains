import { NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Schema for profile update validation
const profileUpdateSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dob: z.string().optional(),
  image: z.string().optional(),
  defaultNationality: z.string().optional(),
  preferredBerth: z.string().optional(),
  gender: z.string().optional(),
  age: z.number().optional(),
});

// GET: Fetch a user profile
export async function GET(
  request: any,
  { params }: any
) {
  try {
    await connectDB();

    // Ensure authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to access their own profile unless they're admin
    if (params.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Find user
    const user = await User.findById(params.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user without sensitive data
    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      naijaRailsId: user.naijaRailsId,
      phone: user.phone || "",
      address: user.address || "",
      dob: user.dob || "",
      image: user.image || "",
      isVerified: user.isVerified,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// PATCH: Update a user profile
export async function PATCH(
  request: any,
  { params }: any
) {
  try {
    await connectDB();

    // Ensure authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to update their own profile unless they're admin
    if (params.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = profileUpdateSchema.parse(body);

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      params.userId,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return updated user without sensitive data
    const userProfile = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      naijaRailsId: updatedUser.naijaRailsId,
      phone: updatedUser.phone || "",
      address: updatedUser.address || "",
      dob: updatedUser.dob || "",
      image: updatedUser.image || "",
      isVerified: updatedUser.isVerified,
      role: updatedUser.role,
      updatedAt: updatedUser.updatedAt,
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a user account
export async function DELETE(
  request: any,
  { params }: any
) {
  try {
    await connectDB();

    // Ensure authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to delete their own account unless they're admin
    if (params.userId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(params.userId);
    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
