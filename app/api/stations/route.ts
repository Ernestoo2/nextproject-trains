import { Station } from "@/utils/mongodb/models";
import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";

export async function GET() {
  try {
    await connectDB();
    const stations = await Station.find({ isActive: true }).select('name code city state');
    return NextResponse.json({ 
      success: true,
      stations: stations.map(station => ({
        _id: station._id.toString(),
        name: station.name,
        code: station.code,
        city: station.city,
        state: station.state,
        isActive: station.isActive
      })),
      message: "Stations fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Failed to fetch stations",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
