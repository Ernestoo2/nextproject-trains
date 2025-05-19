import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Route } from "@/utils/mongodb/models/Route";
import { Station } from "@/utils/mongodb/models/Station";
import { Document } from "mongoose";

interface StationType extends Document {
  _id: string;
  name: string;
  code: string;
}

interface TrainClassType extends Document {
  _id: string;
  className: string;
  classCode: string;
  basePrice: number;
}

interface RouteType extends Document {
  _id: string;
  fromStation: StationType;
  toStation: StationType;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: TrainClassType[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromStationId = searchParams.get("fromStationId");
    const toStationId = searchParams.get("toStationId");

    if (!fromStationId || !toStationId) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required parameters",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const routes = await Route.find({
      fromStation: fromStationId,
      toStation: toStationId,
      isActive: true,
    })
      .populate("fromStation", "stationName stationCode city state")
      .populate("toStation", "stationName stationCode city state")
      .populate("availableClasses", "className classCode basePrice");

    return NextResponse.json({
      success: true,
      data: routes,
      message: "Routes retrieved successfully",
    });
  } catch (error) {
    console.error("Error in route search:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "An error occurred while searching for routes",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { fromStation, toStation, date } = await request.json();

    if (!fromStation || !toStation || !date) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }
 
    // Find routes between the specified stations
    const routes = await Route.find({
      fromStation,
      toStation,
      isActive: true,
    })
      .populate("fromStation", "name code")
      .populate("toStation", "name code")
      .populate("availableClasses", "name code baseFare");

    
    if (!routes.length) {
      // Check if stations exist
      const fromStationExists = await Station.findById(fromStation);
      const toStationExists = await Station.findById(toStation);
 
      return NextResponse.json(
        {
          error: "No routes found between the specified stations",
          details: {
            fromStationExists: !!fromStationExists,
            toStationExists: !!toStationExists,
          },
        },
        { status: 404 },
      );
    }

    // Format the response
    const formattedRoutes = routes.map((route: RouteType) => ({
      id: route._id,
      fromStation: {
        id: route.fromStation._id,
        name: route.fromStation.name,
        code: route.fromStation.code,
      },
      toStation: {
        id: route.toStation._id,
        name: route.toStation.name,
        code: route.toStation.code,
      },
      distance: route.distance,
      baseFare: route.baseFare,
      estimatedDuration: route.estimatedDuration,
      availableClasses: route.availableClasses.map((cls: TrainClassType) => ({
        id: cls._id,
        name: cls.className,
        code: cls.classCode,
        baseFare: cls.basePrice,
      })),
    }));

    return NextResponse.json({ routes: formattedRoutes });
  } catch (error) {
    console.error("Error searching routes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
