import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { seedData } from "@/utils/mongodb/seed";

export async function POST() {
  try {
    console.log("Starting seed operation...");
    
    // Connect to database
    const db = await connectDB();
    console.log("Connected to database successfully");
    
    // Attempt to seed data
    console.log("Beginning data seeding...");
    const result = await seedData();
    console.log("Seed operation completed successfully:", result);
    
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      details: result
    });
    
  } catch (error: any) {
    console.error("Seed operation failed with error:", error);
    
    // Extract detailed error information
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      // If it's a MongoDB error, include additional details
      ...(error.code && {
        codeName: error.codeName,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      })
    };
    
    return NextResponse.json({
      success: false,
      message: "Failed to seed database",
      error: errorDetails
    }, { status: 500 });
  }
}
