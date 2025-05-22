import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/utils/mongodb/connect";
import { ObjectId } from "mongodb";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { User } from "@/utils/mongodb/models/User";

// Define error types for better error handling
type ErrorResponse = {
  success: false;
  message: string;
  error?: string;
  details?: string;
};

export async function POST(
  request: any,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Authentication required",
          error: "UNAUTHORIZED",
          details: "Please sign in to upload an image"
        } as ErrorResponse,
        { status: 401 }
      );
    }

    // Verify user is updating their own profile
    if (session.user.id !== params.userId) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Permission denied",
          error: "FORBIDDEN",
          details: "You can only update your own profile image"
        } as ErrorResponse,
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image") as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false, 
          message: "No image selected",
          error: "MISSING_FILE",
          details: "Please select an image file to upload"
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid file type",
          error: "INVALID_FILE_TYPE",
          details: `File type "${file.type}" is not supported. Please upload an image file (JPEG, PNG, etc.)`
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { 
          success: false, 
          message: "File too large",
          error: "FILE_TOO_LARGE",
          details: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 10MB limit`
        } as ErrorResponse,
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uniqueId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Save to public directory
    const publicDir = join(process.cwd(), "public", "uploads");
    const filePath = join(publicDir, fileName);
    
    try {
      await writeFile(filePath, buffer);
    } catch (writeError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Failed to save image",
          error: "FILE_WRITE_ERROR",
          details: "There was a problem saving the image file. Please try again."
        } as ErrorResponse,
        { status: 500 }
      );
    }

    // Update user profile in database
    try {
      await connectDB();
    } catch (dbError) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Database connection failed",
          error: "DB_CONNECTION_ERROR",
          details: "Unable to connect to the database. Please try again."
        } as ErrorResponse,
        { status: 500 }
      );
    }

    const imageUrl = `/uploads/${fileName}`;
    
    const result = await User.updateOne(
      { _id: new ObjectId(params.userId) },
      { $set: { image: imageUrl, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: "User not found",
          error: "USER_NOT_FOUND",
          details: "The user profile could not be found in the database"
        } as ErrorResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { imageUrl },
      message: "Profile image updated successfully",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error",
        error: "INTERNAL_SERVER_ERROR",
        details: "An unexpected error occurred while processing your request"
      } as ErrorResponse,
      { status: 500 }
    );
  }
} 