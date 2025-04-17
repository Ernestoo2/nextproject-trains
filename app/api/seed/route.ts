import { NextResponse } from "next/server";
import { seedData } from "@/utils/mongodb/seed";
import { connectDB } from "@/utils/mongodb/connect";

export async function POST() {
  try {
    console.log("Starting seed operation...");
    
    // Connect to database
    let db;
    try {
      db = await connectDB();
      console.log("Connected to database successfully");
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to connect to database",
          error: error instanceof Error ? error.message : "Unknown error occurred",
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }

    // Verify database connection
    if (!db.connection.readyState) {
      console.error("Database connection is not ready");
      return NextResponse.json(
        {
          success: false,
          message: "Database connection is not ready",
        },
        { status: 500 }
      );
    }
    
    // Seed the database
    try {
      console.log("Beginning database seeding...");
      const result = await seedData();
      console.log("Database seeding completed:", result);
      
      return NextResponse.json({
        success: true,
        message: "Database seeded successfully",
        result
      });
    } catch (error) {
      console.error("Error in seed operation:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to seed database",
          error: error instanceof Error ? error.message : "Unknown error occurred",
          stack: error instanceof Error ? error.stack : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in seed route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unexpected error occurred",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
