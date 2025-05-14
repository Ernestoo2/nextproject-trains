import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Types } from "mongoose";
import type { ScheduleWithDetails } from "@/types/shared/database";
import type { TrainClass } from "@/types/shared/trains";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Get params safely
    const params = context.params;
    const id = params.id;
    
    // Get query parameters
    const url = new URL(request.url);
    const selectedClass = url.searchParams.get('class');
    const date = url.searchParams.get('date');
    const populate = url.searchParams.get('populate')?.split(',') || [];
    
    console.log(`Schedule ID: ${id}, Class: ${selectedClass}, Date: ${date}`);
    
    if (!Types.ObjectId.isValid(id)) {
      console.error(`Invalid schedule ID format: ${id}`);
      return NextResponse.json({ 
        success: false, 
        message: "Invalid schedule ID format" 
      }, { status: 400 });
    }

    await connectDB();
    
    // Find the schedule and populate related data
    const scheduleQuery = Schedule.findById(id)
      .populate('train')
      .populate({
        path: 'route',
        populate: [
          { path: 'fromStation', model: 'Station' },
          { path: 'toStation', model: 'Station' }
        ]
      });
    
    const schedule = await scheduleQuery;
    
    if (!schedule) {
      console.error(`Schedule not found with ID: ${id}`);
      return NextResponse.json({ 
        success: false, 
        message: "Schedule not found" 
      }, { status: 404 });
    }

    console.log(`Schedule found: ${schedule._id}`);

    // Transform to ScheduleWithDetails format
    const availableClasses = Object.entries(schedule.availableSeats || {}).map(([classCode, seats]) => {
      // Create a valid TrainClass object with all required properties
      const className = classCode === 'EC' ? 'Executive' : 
                        classCode === 'FC' ? 'First Class' : 
                        classCode === 'SL' ? 'Sleeper' : 
                        classCode === 'AC' ? 'AC Chair' : classCode;
      
      const trainClass: TrainClass & { availableSeats: number; fare: number } = {
        _id: new Types.ObjectId().toString(), // Generate a temporary ID
        className, // This is required in TrainClass
        classCode,
        classType: className, // Use className here as well for classType
        basePrice: schedule.fare[classCode] || 0,
        isActive: true,
        availableSeats: seats as number,
        fare: schedule.fare[classCode] || 0
      };
      return trainClass;
    });

    const route = schedule.route;
    const train = schedule.train;

    // Format response with all required fields
    const scheduleWithDetails: ScheduleWithDetails = {
      _id: schedule._id.toString(),
      trainId: train?._id?.toString() || '',
      trainNumber: train?.trainNumber || '',
      trainName: train?.name || '',
      departureStation: route?.fromStation || null,
      arrivalStation: route?.toStation || null,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      duration: schedule.duration || schedule.calculatedDuration || '0h 0m',
      date: schedule.date.toISOString(),
      platform: schedule.platform,
      status: schedule.status,
      availableClasses,
      route: route ? {
        _id: route._id.toString(),
        fromStation: route.fromStation,
        toStation: route.toStation,
        distance: route.distance || 0,
        baseFare: route.baseFare || 0,
        estimatedDuration: route.estimatedDuration || '0h 0m',
        availableClasses: Object.keys(schedule.availableSeats || {})
      } : undefined
    };

    return NextResponse.json({ 
      success: true, 
      data: scheduleWithDetails 
    });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    const errorMessage = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ 
      success: false, 
      message: errorMessage 
    }, { status: 500 });
  }
} 