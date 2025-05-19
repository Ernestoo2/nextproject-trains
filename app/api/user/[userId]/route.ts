import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { connectDB } from "@/utils/mongodb/connect";
import { User } from "@/utils/mongodb/models/User";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    // Await the session properly to fix NextAuth headers issue
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Only allow access to your own profile
    if (session.user.id !== userId && session.user.naijaRailsId !== userId) {
      return NextResponse.json({ success: false, message: "You can only access your own profile" }, { status: 403 });
    }

    await connectDB();

    // Try to find user by ID, naijaRailsId, or email
    const user = await User.findOne({
      $or: [
        { _id: userId },
        { naijaRailsId: userId },
        { email: session.user.email }
      ]
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User profile not found" },
        { status: 404 }
      );
    }

    // Return user data from database
    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      naijaRailsId: user.naijaRailsId,
      phone: user.phone || "",
      address: user.address || "",
      dob: user.dob || "",
      image: session.user.image || undefined,
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString(),
      defaultNationality: "Nigerian", // Default value
      preferredBerth: "LOWER" // Default value
    };

    return NextResponse.json({ success: true, data: userProfile });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    if (!userId || userId === "undefined") {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid user ID" 
      }, { status: 400 });
    }
    
    // Await the session properly to fix NextAuth headers issue
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Only allow users to update their own profile
    if (session.user.id !== userId && session.user.naijaRailsId !== userId) {
      return NextResponse.json({ 
        success: false, 
        message: "You can only update your own profile",
        requestedId: userId,
        sessionUserId: session.user.id
      }, { status: 403 });
    } 
    
    const updates = await request.json();
    
    await connectDB();
    
    // Find the user by ID, naijaRailsId, or email
    const user = await User.findOne({
      $or: [
        { _id: userId },
        { naijaRailsId: userId },
        { email: session.user.email }
      ]
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User profile not found" },
        { status: 404 }
      );
    }
    
    // Update allowed fields only
    const allowedUpdates = [
      'name', 'phone', 'address', 'dob'
    ];
    
    // Apply valid updates
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        user[field] = updates[field];
      }
    });
    
    // Save the updated user
    await user.save();
    
    // Return updated user data
    const updatedProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      naijaRailsId: user.naijaRailsId,
      phone: user.phone || "",
      address: user.address || "",
      dob: user.dob || "",
      image: session.user.image || undefined,
      createdAt: user.createdAt ? user.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : new Date().toISOString()
    };

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
