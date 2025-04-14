import { NextResponse } from "next/server";
import seedData from "@/app/utils/mongodb/seed";

export async function POST(request: Request) {
  try {
    await seedData();
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
    });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed database" },
      { status: 500 },
    );
  }
}
