import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import type {
  Schedule as ISchedule,
  ScheduleWithDetails,
  ApiResponse,
  PaginatedApiResponse,
} from "@/types/shared/database";
import { Schedule } from "@/utils/mongodb/models/Schedule"; 
import {
  authMiddleware,
  validateRequiredParams,
  handleApiError,
} from "@/utils/api/middleware";
import { Types } from "mongoose";

interface ScheduleResponseData {
  schedules: ScheduleWithDetails[];
  page: number;
  limit: number;
  totalResults: number;
  hasMore: boolean;
}

async function getSchedules(
  fromStationId: string,
  toStationId: string,
  date: string
): Promise<ApiResponse<ScheduleResponseData>> {
  try {
    await connectDB();
    const schedules = await Schedule.find({
      "departureStation._id": new Types.ObjectId(fromStationId),
      "arrivalStation._id": new Types.ObjectId(toStationId),
      date: new Date(date),
      isActive: true,
    })
      .populate({
        path: "train",
        select: "trainNumber trainName _id",
      })
      .populate({
        path: "route",
        select:
          "fromStation toStation distance baseFare estimatedDuration availableClasses",
      })
      .lean()
      .exec();

    const transformedSchedules: ScheduleWithDetails[] = schedules.map(
      (schedule: any) => ({
        _id: schedule._id.toString(),
        trainId: schedule.train._id.toString(),
        trainNumber: schedule.train.trainNumber,
        trainName: schedule.train.trainName,
        departureStation: schedule.route.fromStation,
        arrivalStation: schedule.route.toStation,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        duration: schedule.duration || "",
        date: schedule.date.toISOString(),
        platform: schedule.platform,
        status: schedule.status,
        delayReason: schedule.delayReason,
        actualDepartureTime: schedule.actualDepartureTime,
        actualArrivalTime: schedule.actualArrivalTime,
        availableClasses: schedule.availableClasses.map((cls: any) => ({
          ...cls,
          availableSeats: schedule.availableSeats.get(cls.code) || 0,
          fare: schedule.fare.get(cls.code) || cls.baseFare,
        })),
        route: {
          _id: schedule.route._id.toString(),
          fromStation: schedule.route.fromStation,
          toStation: schedule.route.toStation,
          distance: schedule.route.distance,
          baseFare: schedule.route.baseFare,
          estimatedDuration: schedule.route.estimatedDuration,
          availableClasses: schedule.route.availableClasses,
        },
      })
    );

    return {
      success: true,
      data: {
        schedules: transformedSchedules,
        page: 1,
        limit: schedules.length,
        totalResults: schedules.length,
        hasMore: false,
      },
    };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return {
      success: false,
      error: "Failed to fetch schedules",
      status: 400,
    };
  }
}

export async function GET(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const date = searchParams.get("date");
    const fromStationId = searchParams.get("fromStationId");
    const toStationId = searchParams.get("toStationId");

    const validationError = validateRequiredParams(
      { date, fromStationId, toStationId },
      ["date", "fromStationId", "toStationId"]
    );

    if (validationError) {
      return NextResponse.json(validationError, {
        status: validationError.status,
      });
    }

    const scheduleResponse = await getSchedules(
      fromStationId || "",
      toStationId || "",
      date || ""
    );

    if (!scheduleResponse.success || !scheduleResponse.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch schedules",
          status: 400,
        },
        { status: 400 }
      );
    }

    const response: PaginatedApiResponse<ScheduleWithDetails[]> = {
      success: true,
      data: scheduleResponse.data.schedules,
      message: "Schedules fetched successfully",
      pagination: {
        currentPage: scheduleResponse.data.page,
        totalPages: Math.ceil(
          scheduleResponse.data.totalResults / scheduleResponse.data.limit
        ),
        totalItems: scheduleResponse.data.totalResults,
        limit: scheduleResponse.data.limit,
        hasMore: scheduleResponse.data.hasMore,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
