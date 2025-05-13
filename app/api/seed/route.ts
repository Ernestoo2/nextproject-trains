import { NextResponse } from "next/server";
import { seedDatabase } from "@/utils/mongodb/seed/seedOrchestrator";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
