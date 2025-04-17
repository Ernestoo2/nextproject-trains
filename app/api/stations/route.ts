 import { Station } from "@/utils/mongodb/models";
import { NextResponse } from "next/server";
 
export async function GET() {
  try {
    const stations = await Station.find({ isActive: true }).select('name code');
    return NextResponse.json({ stations });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}
