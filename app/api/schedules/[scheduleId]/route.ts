import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/utils/mongodb/connect";
import { Schedule } from "@/utils/mongodb/models/Schedule";

export async function GET(
  request: NextRequest,
  { params }: { params: { scheduleId: string } }
) {
  try {
    const { scheduleId } = params;
    const searchParams = request.nextUrl.searchParams;
    const classType = searchParams.get("class");
    const date = searchParams.get("date");

    if (!scheduleId || !mongoose.Types.ObjectId.isValid(scheduleId)) {
      return NextResponse.json({
        success: false,
        message: "Invalid schedule ID",
      });
    }

    await connectDB();

    const schedule = await Schedule.findById(scheduleId)
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
      });

    if (!schedule) {
      return NextResponse.json({
        success: false,
        message: "Schedule not found",
      });
    }

    // Transform the schedule data to match the expected format
    const transformedSchedule = {
      _id: schedule._id,
      trainNumber: schedule.train?.trainNumber || '',
      trainName: schedule.train?.trainName || '',
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
      duration: schedule.duration,
      availableClasses: schedule.route.availableClasses.map((cls: any) => ({
        _id: cls._id,
        name: cls.name,
        code: cls.code,
        baseFare: cls.baseFare,
        availableSeats: schedule.availableSeats[cls.code] || 0,
      })),
      status: schedule.status,
      platform: schedule.platform,
      date: schedule.date,
    };

    return NextResponse.json({
      success: true,
      schedule: transformedSchedule,
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while fetching the schedule",
    });
  }
} 