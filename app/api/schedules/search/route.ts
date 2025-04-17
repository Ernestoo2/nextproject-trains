import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Route } from "@/utils/mongodb/models/Route";
import mongoose from "mongoose";
import { ApiResponse } from "@/utils/mongodb/types";
import { ScheduleWithDetails } from "@/types/route.types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fromStationId = searchParams.get("fromStationId");
    const toStationId = searchParams.get("toStationId");
    const date = searchParams.get("date");
    const classType = searchParams.get("classType");

    console.log("Search params:", { fromStationId, toStationId, date, classType });

    // Validate required parameters
    if (!fromStationId || !toStationId || !date) {
      console.log("Missing required parameters");
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        data: null,
        message: "Missing required parameters: fromStationId, toStationId, and date are required",
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(fromStationId) || !mongoose.Types.ObjectId.isValid(toStationId)) {
      console.log("Invalid station IDs");
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        data: null,
        message: "Invalid station IDs provided",
      });
    }

    await connectDB();
    console.log("Connected to database");

    // First, find the route between these stations
    const route = await Route.findOne({
      fromStation: fromStationId,
      toStation: toStationId,
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

    // Build the query for schedules
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      route: route._id,
      isActive: true,
      date: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
      status: 'SCHEDULED'
    };

    // Add class filter if specified
    if (classType) {
      query[`availableSeats.${classType}`] = { $gt: 0 };
    }

    console.log("MongoDB query:", JSON.stringify(query, null, 2));

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

    console.log("Found schedules:", schedules.length);

    if (schedules.length === 0) {
      console.log("No schedules found for the given criteria");
      return NextResponse.json<ApiResponse<ScheduleWithDetails[]>>({
        success: true,
        data: [],
        message: "No schedules found for the given criteria",
      });
    }

    // Transform the results
    const results: ScheduleWithDetails[] = schedules.map((schedule) => {
      // Calculate fares for each class
      const fares = schedule.route.availableClasses.reduce((acc: Record<string, number>, cls: any) => {
        acc[cls.code] = Math.round(cls.baseFare * (schedule.route.distance / 100));
        return acc;
      }, {});

      return {
        _id: schedule._id.toString(),
        trainNumber: schedule.train.trainNumber,
        trainName: schedule.train.trainName,
        departureStation: {
          name: schedule.route.fromStation.name,
          code: schedule.route.fromStation.code,
          city: schedule.route.fromStation.city,
          state: schedule.route.fromStation.state,
        },
        arrivalStation: {
          name: schedule.route.toStation.name,
          code: schedule.route.toStation.code,
          city: schedule.route.toStation.city,
          state: schedule.route.toStation.state,
        },
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        duration: schedule.duration || schedule.route.estimatedDuration,
        availableClasses: schedule.route.availableClasses.map((trainClass: any) => ({
          _id: trainClass._id.toString(),
          name: trainClass.name,
          code: trainClass.code,
          baseFare: fares[trainClass.code],
          availableSeats: schedule.availableSeats.get(trainClass.code) || 0,
        })),
        status: schedule.status,
        platform: schedule.platform || null,
      };
    });

    return NextResponse.json<ApiResponse<ScheduleWithDetails[]>>({
      success: true,
      data: results,
      message: "Schedules found successfully",
    });
  } catch (error) {
    console.error("Error searching schedules:", error);
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      data: null,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
} 