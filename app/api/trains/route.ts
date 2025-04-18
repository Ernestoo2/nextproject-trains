// app/api/trains/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Train } from "@/utils/mongodb/models/Train";

export async function GET() {
  try {
    await connectDB();
    const trains = await Train.find().sort({ trainNumber: 1 });
    return NextResponse.json({ trains });
  } catch (error) {
    console.error("Error fetching trains:", error);
    return NextResponse.json(
      { error: "Failed to fetch trains" },
      { status: 500 }
    );
  }
}
