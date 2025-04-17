import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/mongodb/connect';
import { Schedule } from '@/utils/mongodb/models/Schedule';

export async function GET() {
  try {
    console.log("Starting schedules fetch...");
    await connectDB();
    console.log("Connected to database");

    const schedules = await Schedule.find({ isActive: true })
      .populate({
        path: 'train',
        select: 'trainName trainNumber',
      })
      .populate({
        path: 'route',
        select: 'fromStation toStation distance baseFare estimatedDuration availableClasses',
        populate: [
          { path: 'fromStation', select: 'name code city state' },
          { path: 'toStation', select: 'name code city state' },
          { path: 'availableClasses', select: 'name code baseFare' }
        ]
      })
      .sort({ departureTime: 1 });

    console.log(`Found ${schedules.length} schedules`);
    
    if (schedules.length === 0) {
      // Let's check if we have any schedules at all
      const totalSchedules = await Schedule.countDocuments();
      console.log(`Total schedules in database: ${totalSchedules}`);
      
      // Let's check if we have any schedules without the isActive filter
      const allSchedules = await Schedule.find({});
      console.log(`Total schedules without isActive filter: ${allSchedules.length}`);
    }

    return NextResponse.json({
      success: true,
      schedules: schedules.map(schedule => ({
        _id: schedule._id.toString(),
        trainNumber: schedule.train.trainNumber,
        trainName: schedule.train.trainName,
        departureStation: schedule.route.fromStation,
        arrivalStation: schedule.route.toStation,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        date: schedule.date,
        availableClasses: schedule.route.availableClasses.map((cls: any) => ({
          _id: cls._id.toString(),
          name: cls.name,
          code: cls.code,
          baseFare: cls.baseFare,
          availableSeats: schedule.availableSeats[cls.code] || 0,
        })),
        status: schedule.status,
      })),
      message: schedules.length > 0 ? "Schedules fetched successfully" : "No schedules found"
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch schedules",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 