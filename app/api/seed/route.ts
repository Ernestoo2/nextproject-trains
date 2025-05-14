import { NextResponse } from "next/server";
import { seedDatabase } from "@/utils/mongodb/seed/seedOrchestrator";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in seed API:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: String(error) },
      { status: 500 }
    );
  }
}
