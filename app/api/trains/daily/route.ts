import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Route } from "@/utils/mongodb/models/Route";
import { Station } from "@/utils/mongodb/models/Station";
import { TrainClass } from "@/utils/mongodb/models/TrainClass";
import { Train } from "@/utils/mongodb/models/Train";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Document, Types } from "mongoose";

interface PopulatedSchedule extends Document {
  _id: Types.ObjectId;
  train: {
    _id: Types.ObjectId;
    trainNumber: string;
    trainName: string;
  };
  route: {
    _id: Types.ObjectId;
    fromStation: {
      _id: Types.ObjectId;
      name: string;
      code: string;
    };
    toStation: {
      _id: Types.ObjectId;
      name: string;
      code: string;
    };
    availableClasses: {
      _id: Types.ObjectId;
      code: string;
      name: string;
      baseFare: number;
    }[];
  };
  departureTime: string;
  arrivalTime: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  availableSeats: Record<string, number>;
}

export async function GET() {
  try {
    await connectDB();

    // Get current date in the same format as our seed data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all schedules for today
    const schedules = await Schedule.find({
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) // Next day
      },
      isActive: true
    })
    .populate({
      path: 'train',
      model: Train,
      select: 'trainNumber trainName'
    })
    .populate({
      path: 'route',
      model: Route,
      populate: [
        {
          path: 'fromStation',
          model: Station,
          select: 'name code'
        },
        {
          path: 'toStation',
          model: Station,
          select: 'name code'
        },
        {
          path: 'availableClasses',
          model: TrainClass,
          select: 'code name baseFare'
        }
      ]
    }) as unknown as PopulatedSchedule[];

    // Transform the data to match our frontend needs
    const transformedSchedules = schedules.map(schedule => ({
      _id: schedule._id.toString(),
      trainNumber: schedule.train.trainNumber,
      trainName: schedule.train.trainName,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      departureStation: {
        _id: schedule.route.fromStation._id.toString(),
        name: schedule.route.fromStation.name,
        code: schedule.route.fromStation.code
      },
      arrivalStation: {
        _id: schedule.route.toStation._id.toString(),
        name: schedule.route.toStation.name,
        code: schedule.route.toStation.code
      },
      status: schedule.status,
      availableClasses: schedule.route.availableClasses.map(cls => ({
        code: cls.code,
        name: cls.name,
        availableSeats: schedule.availableSeats[cls.code] || 0,
        baseFare: cls.baseFare
      }))
    }));

    return NextResponse.json({
      success: true,
      data: transformedSchedules
    });
  } catch (error) {
    console.error('Error fetching daily trains:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch daily trains',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 