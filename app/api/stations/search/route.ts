import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Station } from "@/utils/mongodb/models/Station";
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchQuery = request.nextUrl.searchParams.get("q");

    if (!searchQuery) {
      return NextResponse.json(
        { success: false, message: "Search query is required" },
        { status: 400 }
      );
    }

    const stations = await Station.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { code: { $regex: searchQuery, $options: "i" } }
      ]
    })
    .limit(10)
    .lean();

    return NextResponse.json({
      success: true,
      data: stations
    });

  } catch (error) {
    console.error('Error searching stations:', error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 