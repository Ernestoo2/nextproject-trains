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

export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Find user or create default profile
    let user = await User.findOne({ email: session.user.email });

    // If user doesn't exist, create a default profile
    if (!user) {
      const naijaRailsId = `NR${Math.floor(Math.random() * 10000000000)
        .toString()
        .padStart(10, "0")}`;
      user = await User.create({
        email: session.user.email,
        name: session.user.name || "",
        naijaRailsId,
        role: "user",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
