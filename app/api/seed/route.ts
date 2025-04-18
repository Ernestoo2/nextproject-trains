import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { seedData } from "@/utils/mongodb/seed";

export async function POST() {
  try {
    await connectDB();
    await seedData();
    return NextResponse.json({ 
      success: true, 
      message: "Database seeded successfully" 
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed database" },
      { status: 500 }
    );
  }
}
