import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Station } from "@/utils/mongodb/models/Station";

export async function GET() {
  try {
    await connectDB();

    const stations = await Station.find({ isActive: true }).lean();

    if (!stations || stations.length === 0) {
      return NextResponse.json(
        { success: false, message: "No active stations found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: stations.map((station) => ({
        id: station._id,
        name: station.stationName,
        code: station.stationCode,
        city: station.city,
        state: station.state,
        region: station.region,
        address: station.address,
        platforms: station.platforms,
        isActive: station.isActive,
      })),
    });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}