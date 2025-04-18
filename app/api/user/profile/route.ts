import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";

export async function PUT(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Get request body
    const updates = await req.json();

    // Find and update user, create if doesn't exist
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        ...updates,
        email: session.user.email,
        name: updates.name || session.user.name,
        updatedAt: new Date().toISOString(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}

export async function GET(_req: Request) {
  try {
    await connectDB();
    const users = await User.find().select("-password").sort({ name: 1 });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profiles" },
      { status: 500 }
    );
  }
}
