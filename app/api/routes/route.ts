import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Route } from "@/utils/mongodb/models/Route";

export async function GET() {
  try {
    await connectDB();
    const routes = await Route.find({ isActive: true })
      .populate('fromStation')
      .populate('toStation')
      .populate('availableClasses');

    return NextResponse.json({
      success: true,
      routes: routes.map(route => ({
        _id: route._id.toString(),
        fromStation: {
          _id: route.fromStation._id.toString(),
          name: route.fromStation.name,
          code: route.fromStation.code,
        },
        toStation: {
          _id: route.toStation._id.toString(),
          name: route.toStation.name,
          code: route.toStation.code,
        },
        distance: route.distance,
        baseFare: route.baseFare,
        estimatedDuration: route.estimatedDuration,
        availableClasses: route.availableClasses.map((cls: any) => ({
          _id: cls._id.toString(),
          name: cls.name,
          code: cls.code,
          baseFare: cls.baseFare,
        })),
        isActive: route.isActive,
      })),
      message: "Routes fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch routes",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 