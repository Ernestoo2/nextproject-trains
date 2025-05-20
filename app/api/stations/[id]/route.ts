import { NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect";
import { Station } from "@/utils/mongodb/models/Station";
import { Types } from "mongoose";

export async function GET(
  request: any,
  { params }: any
) {
  try {
    const { id } = params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid station ID format" 
      }, { status: 400 });
    }

    await connectDB();
    
    const station = await Station.findById(id);
    
    if (!station) {
      return NextResponse.json({ 
        success: false, 
        message: "Station not found" 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: station 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ 
      success: false, 
      message: errorMessage 
    }, { status: 500 });
  }
}
