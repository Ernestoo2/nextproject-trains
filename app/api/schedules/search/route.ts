import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/mongodb/connect";
import { Route } from "@/utils/mongodb/models/Route";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Station } from "@/utils/mongodb/models/Station";
import { cls } from "./type";

type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string;
};

export async function GET(request: NextRequest) {
  try {
    console.log("Starting schedule search...");
    const { searchParams } = new URL(request.url);
    const fromStationId = searchParams.get("fromStationId");
    const toStationId = searchParams.get("toStationId");
    const date = searchParams.get("date");
    const classType = searchParams.get("classType");

    console.log("Search parameters:", {
      fromStationId,
      toStationId,
      date,
      classType,
    });

    // Validate required parameters
    if (!fromStationId || !toStationId || !date) {
      console.log("Missing required parameters");
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        data: null,
        message: "Missing required parameters",
      });
    }

    // Validate station IDs
    if (!mongoose.Types.ObjectId.isValid(fromStationId) || !mongoose.Types.ObjectId.isValid(toStationId)) {
      console.log("Invalid station IDs");
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        data: null,
        message: "Invalid station IDs",
      });
    }

    await connectDB();
    console.log("Connected to database");

    // First, find the route between these stations
    const route = await Route.findOne({
      fromStation: new mongoose.Types.ObjectId(fromStationId),
      toStation: new mongoose.Types.ObjectId(toStationId),
      isActive: true,
    }).populate(['fromStation', 'toStation', 'availableClasses']);

    console.log("Found route:", route ? route._id : 'No route found');

    if (!route) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        data: null,
        message: "No route found between the specified stations",
      });
    }

    // Parse and validate the date
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    if (isNaN(searchDate.getTime())) {
      console.log("Invalid date format");
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        data: null,
        message: "Invalid date format",
      });
    }

    // Construct query
    const query: any = {
      route: route._id,
      date: searchDate,
      isActive: true,
      status: "SCHEDULED",
    };

    // Add class filter if specified
    if (classType) {
      query[`availableSeats.${classType}`] = { $gt: 0 };
    }

    console.log("MongoDB query:", JSON.stringify(query, null, 2));

    // Count total schedules in DB for debugging
    const totalSchedules = await Schedule.countDocuments({});
    console.log("Total schedules in DB:", totalSchedules);

    // Count schedules for this specific route
    const routeSchedules = await Schedule.countDocuments({ route: route._id });
    console.log("Schedules for this route:", routeSchedules);

    // Find schedules with populated data
    const schedules = await Schedule.find(query)
      .populate({
        path: "train",
        select: "trainName trainNumber",
      })
      .populate({
        path: "route",
        select: "fromStation toStation distance baseFare estimatedDuration availableClasses",
        populate: [
          { path: "fromStation", select: "name code city state" },
          { path: "toStation", select: "name code city state" },
          { path: "availableClasses", select: "name code baseFare" }
        ]
      })
      .sort({ departureTime: 1 });

    console.log(`Found ${schedules.length} schedules for the route`);

    if (schedules.length === 0) {
      return NextResponse.json<ApiResponse<typeof Schedule[]>>({
        success: true,
        data: [],
        message: "No schedules found for the given criteria",
      });
    }

    // Transform schedules into the required format
    const transformedSchedules = schedules.map(schedule => {
      console.log(`Processing schedule ${schedule._id}`);
      const route = schedule.route;
      if (!route) {
        console.log(`No route found for schedule ${schedule._id}`);
        return null;
      }

      return {
        _id: schedule._id,
        trainNumber: schedule.train?.trainNumber || '',
        trainName: schedule.train?.trainName || '',
        departureStation: {
          name: route.fromStation.name,
          code: route.fromStation.code,
          city: route.fromStation.city,
          state: route.fromStation.state,
        },
        arrivalStation: {
          name: route.toStation.name,
          code: route.toStation.code,
          city: route.toStation.city,
          state: route.toStation.state,
        },
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
        duration: schedule.duration,
        availableClasses: route.availableClasses.map((cls: cls) => ({
          _id: cls._id,
          name: cls.name,
          code: cls.code,
          baseFare: cls.baseFare,
          availableSeats: schedule.availableSeats[cls.code] || 0,
        })),
      status: schedule.status,
        platform: schedule.platform,
      };
    }).filter(Boolean);

    console.log(`Transformed ${transformedSchedules.length} schedules`);

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: transformedSchedules,
      message: "Schedules found successfully",
    });
  } catch (error) {
    console.error("Error in schedule search:", error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "An error occurred while searching for schedules",
    });
  }
} 