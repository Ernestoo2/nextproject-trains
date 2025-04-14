// app/api/trains/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/app/utils/mongodb/connect";
import { Train, Station, TrainClass } from "@/app/utils/mongodb/models";
import { trainData } from "@/app/api/api";
import mongoose from "mongoose";
import { ITrain } from "@/app/utils/mongodb/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get("trainId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Only connect if not already connected
    if (!mongoose.connection.readyState) {
      await connectDB();
    }

    // Handle single train request
    if (trainId) {
      let train;
      
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

    const skip = (page - 1) * limit;
    const [trains, total] = await Promise.all([
      Train.find({ isActive: true })
        .populate("routes.station", "name code")
        .populate("classes", "name code")
        .skip(skip)
        .limit(limit)
        .lean(),
      Train.countDocuments({ isActive: true })
    ]);

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
    const validatedTrains = trains.map((train) => {
      if (!train.routes || !Array.isArray(train.routes)) {
        console.error('Invalid train routes:', train);
        return null;
      }
      return {
        ...train,
        routes: train.routes.map(route => ({
          ...route,
          station: route.station || { name: "Unknown Station", code: "N/A" }
        })),
        classes: train.classes || []
      };
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
