import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";
import { connectDB } from "@/utils/mongodb/connect";
import { Route } from "@/utils/mongodb/models/Route";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import type { ScheduleWithDetails, ScheduleStatus } from "@/types/shared/trains";
import type { ScheduleSearchResponse } from "@/types/schedule.types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromStationId = searchParams.get("fromStationId");
    const toStationId = searchParams.get("toStationId");
    const date = searchParams.get("date");

    if (!fromStationId || !toStationId || !date) {
      return NextResponse.json<ScheduleSearchResponse>({
        success: false,
        message: "Missing required parameters",
      });
    }

    await connectDB();

    // Debug: Check if route exists
    const route = await Route.findOne({
      fromStation: new mongoose.Types.ObjectId(fromStationId),
      toStation: new mongoose.Types.ObjectId(toStationId),
    });

    if (!route) {
      return NextResponse.json<ScheduleSearchResponse>({
        success: false,
        message: "No route found between stations",
      });
    }

    // Debug: Check schedules for this route
    const allRouteSchedules = await Schedule.find({ route: route._id });
    if (allRouteSchedules.length > 0) {
      // Schedules exist for this route, continue with search
    }

    // Parse the input date and create start/end range for the full day
    const searchDate = new Date(date);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const query = {
      route: new mongoose.Types.ObjectId(route._id),
      $or: [
        {
          // Search by ISODate
          date: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        },
        {
          // Also search by date string format
          date: date
        }
      ],
      isActive: true,
      status: { $in: ["SCHEDULED", "DELAYED"] }
    };

    const schedules = await Schedule.find(query)
      .populate({
        path: "route",
        populate: [
          { path: "fromStation" },
          { path: "toStation" },
          { path: "availableClasses" }
        ]
      })
      .populate("train");

    // Transform schedules to match ScheduleWithDetails interface
    const transformedSchedules = schedules
      .filter(schedule => schedule.train && schedule.route)
      .map(schedule => {
        return {
          _id: schedule._id.toString(),
          trainId: schedule.train._id.toString(),
          trainNumber: schedule.train.trainNumber,
          trainName: schedule.train.trainName,
          train: {
            id: schedule.train._id.toString(),
            name: schedule.train.trainName,
            number: schedule.train.trainNumber,
            classes: (schedule.train.classes || []).map((cls: any) => ({
              id: cls._id.toString(),
              name: cls.className || cls.name,
              code: cls.classCode || cls.code,
              baseFare: cls.basePrice || cls.baseFare || 0,
              capacity: cls.capacity || 0
            }))
          },
          route: {
            id: schedule.route._id.toString(),
            name: `${schedule.route.fromStation.stationName} to ${schedule.route.toStation.stationName}`,
            distance: schedule.route.distance,
            duration: schedule.route.estimatedDuration,
            baseFare: schedule.route.baseFare,
            fromStation: schedule.route.fromStation,
            toStation: schedule.route.toStation
          },
          availableClasses: schedule.route.availableClasses.map((cls: any) => ({
            className: cls.className || cls.name,
            classCode: cls.classCode || cls.code,
            name: cls.className || cls.name,
            code: cls.classCode || cls.code,
            baseFare: cls.basePrice || cls.baseFare || 0,
            availableSeats: schedule.availableSeats.get(cls._id.toString()) || 0,
            fare: schedule.fare.get(cls._id.toString()) || cls.basePrice || cls.baseFare || 0
          })),
          date: schedule.date instanceof Date ? schedule.date.toISOString() : schedule.date,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          actualDepartureTime: schedule.actualDepartureTime,
          actualArrivalTime: schedule.actualArrivalTime,
          delayReason: schedule.delayReason,
          duration: schedule.duration || schedule.route.estimatedDuration || "",
          distance: schedule.route.distance,
          platform: schedule.platform || "TBA",
          status: schedule.status,
          isActive: schedule.isActive ?? true,
          departureStation: schedule.route.fromStation,
          arrivalStation: schedule.route.toStation,
          fare: schedule.fare instanceof Map ? Object.fromEntries(schedule.fare) : schedule.fare || {}
        };
      });

    return NextResponse.json<ScheduleSearchResponse>({
      success: true,
      data: transformedSchedules,
      message: transformedSchedules.length ? "Schedules found successfully" : "No schedules found for the given criteria",
    });

  } catch (error) {
    return NextResponse.json<ScheduleSearchResponse>({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while searching for schedules",
    });
  }
}
