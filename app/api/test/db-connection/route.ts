import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import mongoose from "mongoose";

export async function GET() {
  try {
    // Test database connection
    await connectDB();
    
    return NextResponse.json({
      success: true,
      message: "Connected to MongoDB successfully",
      dbName: mongoose.connection.db?.databaseName,
      connectionState: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      mongoVersion: mongoose.version,
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoURI: !!process.env.MONGODB_URI,
        mongoURIStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + "..." : "Not defined",
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to connect to MongoDB",
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 