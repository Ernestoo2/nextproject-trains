import { NextResponse } from "next/server";
import seedData from "@/utils/mongodb/seed";

export async function POST() {
  try {
    await seedData();
    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database" },
      { status: 500 }
    );
  }
}
