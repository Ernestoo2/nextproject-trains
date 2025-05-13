import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Route } from "@/utils/mongodb/models/Route";
import { TrainClass } from "@/utils/mongodb/models/TrainClass";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get("routeId");
    const classCode = searchParams.get("classCode");

    if (!routeId || !classCode) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get route details
    const route = await Route.findById(routeId).populate({
      path: "availableClasses",
      model: TrainClass,
      match: { code: classCode }
    });

    if (!route) {
      return NextResponse.json(
        { success: false, message: "Route not found" },
        { status: 404 }
      );
    }

    const selectedClass = route.availableClasses[0];
    if (!selectedClass) {
      return NextResponse.json(
        { success: false, message: "Class not available for this route" },
        { status: 404 }
      );
    }

    // Calculate fares based on route's base fare and class multiplier
    const baseFare = route.baseFare;
    const classBaseFare = selectedClass.baseFare;

    // Return fare details
    return NextResponse.json({
      success: true,
      data: {
        routeBaseFare: baseFare,
        classBaseFare: classBaseFare,
        classDetails: selectedClass,
        distance: route.distance,
        estimatedDuration: route.estimatedDuration
      }
    });

  } catch (error) {
    console.error("Error fetching fare details:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch fare details"
      },
      { status: 500 }
    );
  }
}