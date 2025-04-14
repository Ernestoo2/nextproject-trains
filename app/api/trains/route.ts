// app/api/trains/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/app/utils/mongodb/connect";
import { Train } from "@/app/utils/mongodb/models/Train";
import { trainData } from "@/app/api/api";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get("trainId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    await connectDB();

    // Handle single train request
    if (trainId) {
      let train;
      
      // Check if it's a mock data request
      if (!mongoose.Types.ObjectId.isValid(trainId)) {
        train = trainData.find((t) => t.id === Number(trainId));
        if (!train) {
          return NextResponse.json(
            { success: false, message: "Train not found" },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: train });
      }

      // Handle MongoDB request
      train = await Train.findById(trainId)
        .populate("routes.station", "name code")
        .populate("classes", "name code")
        .lean();

      if (!train) {
        return NextResponse.json(
          { success: false, message: "Train not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: train });
    }

    // Handle paginated train list request
    const skip = (page - 1) * limit;
    const [trains, total] = await Promise.all([
      Train.find({ isActive: true })
        .populate({
          path: 'routes.station',
          select: 'name code'
        })
        .populate({
          path: 'classes',
          select: 'name code'
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      Train.countDocuments({ isActive: true })
    ]);

    // If no trains in database, return mock data
    if (trains.length === 0) {
      return NextResponse.json({
        success: true,
        data: trainData.slice(skip, skip + limit),
        pagination: {
          total: trainData.length,
          page,
          pages: Math.ceil(trainData.length / limit)
        }
      });
    }

    // Validate populated data before sending
    const validatedTrains = trains.map(train => {
      if (!train.routes || !Array.isArray(train.routes)) {
        console.error('Invalid train routes:', train);
        return null;
      }
      return train;
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: validatedTrains,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching trains:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch trains" },
      { status: 500 }
    );
  }
}
