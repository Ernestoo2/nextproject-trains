import { NextResponse } from "next/server";
import { connectDB } from "@/app/utils/mongodb/connect";
import { Station } from "@/app/utils/mongodb/models/Station";

export async function GET(request: Request) {
  try {
    await connectDB();
    const stations = await Station.find({ isActive: true });

    return NextResponse.json({
      success: true,
      data: stations,
      message: "Stations fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch stations" },
      { status: 500 },
    );
  }
}
