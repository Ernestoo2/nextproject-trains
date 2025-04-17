import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Station } from "@/utils/mongodb/models/Station";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const stationId = params.id;

    if (!mongoose.Types.ObjectId.isValid(stationId)) {
       return NextResponse.json({ error: "Invalid Station ID" }, { status: 400 });
    }

    const station = await Station.findById(stationId).select('name code city state'); // Select needed fields
    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }
    return NextResponse.json({ station }, { status: 200 });
  } catch (error) {
    console.error("Error fetching station:", error);
    return NextResponse.json({ error: "Failed to fetch station" }, { status: 500 });
  }
}