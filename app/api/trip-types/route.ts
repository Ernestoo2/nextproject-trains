import { NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect";
import { TripType } from "@/utils/mongodb/models/TripType";

export async function GET(_request: Request) {
  try {
    await connectDB();
    const tripTypes = await TripType.find().sort({ name: 1 });
    return NextResponse.json({ tripTypes });
  } catch (error) {
    console.error("Error fetching trip types:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip types" },
      { status: 500 },
    );
  }
}
