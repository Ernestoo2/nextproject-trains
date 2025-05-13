import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/utils/mongodb/connect";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Train } from "@/utils/mongodb/models/Train";
import { Route } from "@/utils/mongodb/models/Route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  
  try {
    await connectDB();
    
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid ID" },
        { status: 400 }
      );
    }

    const schedule = await Schedule.findById(id)
      .populate("train")
      .populate("route")
      .lean();

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: "Schedule not found" },
        { status: 404 }
      );
    }

    // Get additional query parameters
    const selectedClass = searchParams.get("class");
    const date = searchParams.get("date");

    // Add selected class and date to the response
    const response = {
      ...schedule,
      selectedClass,
      date,
    };

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch schedule" },
      { status: 500 }
    );
  }
} 