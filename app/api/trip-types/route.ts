import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { TripType } from "@/utils/mongodb/models/TripType";

export async function GET(request: Request) {
  try {
    await connectDB();
    const tripTypes = await TripType.find({ isActive: true });

    return NextResponse.json({
      success: true,
      data: tripTypes,
      message: "Trip types fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching trip types:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trip types" },
      { status: 500 },
    );
  }
}
