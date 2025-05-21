
import { NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect"; 
import { z } from "zod";
import { TrainSchedule } from "@/utils/mongodb/models/trainSchedule";

// Validation schema for query parameters
const querySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  date: z.string().optional(),
  trainId: z.string().optional(),
  limit: z.string().optional(),
  page: z.string().optional(),
});

export async function GET(request: any) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedParams = querySchema.parse(queryParams);

    // Build filter object
    const filter: any = {};
    if (validatedParams.from) {
      filter["routes.0.station.code"] = validatedParams.from.toUpperCase();
    }
    if (validatedParams.to) {
      filter["routes.1.station.code"] = validatedParams.to.toUpperCase();
    }
    if (validatedParams.date) {
      const date = new Date(validatedParams.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      filter.journeyDate = {
        $gte: date,
        $lt: nextDay,
      };
    }
    if (validatedParams.trainId) {
      filter.trainId = validatedParams.trainId;
    }

    // Pagination
    const limit = validatedParams.limit ? parseInt(validatedParams.limit) : 10;
    const page = validatedParams.page ? parseInt(validatedParams.page) : 1;
    const skip = (page - 1) * limit;

    // Execute query
    const [schedules, total] = await Promise.all([
      TrainSchedule.find(filter)
        .sort({ journeyDate: 1, "routes.0.departureTime": 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      TrainSchedule.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        schedules,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid query parameters",
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
      success: false,
        message: "Failed to fetch schedules",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: any) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request body
    const scheduleSchema = z.object({
      trainId: z.string(),
      journeyDate: z.string(),
      routes: z.array(
        z.object({
          station: z.object({
            code: z.string(),
            name: z.string(),
          }),
          arrivalTime: z.string().optional(),
          departureTime: z.string(),
          distance: z.number(),
          platform: z.string(),
        })
      ),
      status: z.enum(["SCHEDULED", "DELAYED", "CANCELLED", "COMPLETED"]),
      classes: z.array(
        z.object({
          code: z.string(),
          name: z.string(),
          fare: z.number(),
          availableSeats: z.number(),
        })
      ),
    });

    const validatedData = scheduleSchema.parse(body);

    // Create new schedule
    const schedule = await TrainSchedule.create(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: schedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating schedule:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request data",
          errors: error.errors,
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create schedule",
      },
      { status: 500 }
    );
  }
}
