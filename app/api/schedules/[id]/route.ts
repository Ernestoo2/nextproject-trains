import { NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Types } from "mongoose";
import type { ScheduleWithDetails, TrainClass as TrainClassTypeAlias, ScheduleStatus } from "@/types/shared/trains";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    // Get params safely
    const { id } = await context.params;
     
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        message: "Invalid schedule ID format" 
      }, { status: 400 });
    }

    await connectDB();
    
    const scheduleDoc = await Schedule.findById(id)
      .populate({
        path: 'train',
        populate: {
          path: 'classes',
          model: 'TrainClass'
        }
      })
      .populate({
        path: 'route',
        populate: [
          { path: 'fromStation', model: 'Station' },
          { path: 'toStation', model: 'Station' }
        ]
      });
    
    if (!scheduleDoc) {
      return NextResponse.json({ 
        success: false, 
        message: "Schedule not found" 
      }, { status: 404 });
    }

    const manualFareObject: Record<string, number> = {};
    if (scheduleDoc.fare instanceof Map) {
      for (const [key, value] of scheduleDoc.fare) {
        manualFareObject[key] = value as number;
      }
    } else if (typeof scheduleDoc.fare === 'object' && scheduleDoc.fare !== null) {
      for (const [key, value] of Object.entries(scheduleDoc.fare)) {
        if (typeof value === 'number') {
          manualFareObject[key] = value;
        }
      }
    }

    const manualAvailableSeatsObject: Record<string, number> = {};
    if (scheduleDoc.availableSeats instanceof Map) {
      for (const [key, value] of scheduleDoc.availableSeats) {
        manualAvailableSeatsObject[key] = value as number;
      }
    } else if (typeof scheduleDoc.availableSeats === 'object' && scheduleDoc.availableSeats !== null) {
      for (const [key, value] of Object.entries(scheduleDoc.availableSeats)) {
        if (typeof value === 'number') {
          manualAvailableSeatsObject[key] = value;
        }
      }
    }

    const availableClassesForUI = Object.entries(manualAvailableSeatsObject).map(([classIdString, seats]) => {
      const trainClassInfo = scheduleDoc.train?.classes?.find(
        (tc: any) => tc._id.toString() === classIdString
      );
      
      const className = trainClassInfo?.className || classIdString;
      const classType = trainClassInfo?.classType || className;
      const classCode = trainClassInfo?.classCode || classIdString; 

      return {
        _id: classIdString, 
        className,
        classCode,
        classType: classType as TrainClassTypeAlias['classType'],
        basePrice: (manualFareObject[classIdString] as number) || trainClassInfo?.basePrice || 0,
        isActive: trainClassInfo?.isActive !== undefined ? trainClassInfo.isActive : true,
        availableSeats: seats as number,
        fare: (manualFareObject[classIdString] as number) || trainClassInfo?.basePrice || 0,
      };
    });

    const schedule = scheduleDoc.toObject({ virtuals: true });

    const routeDoc = schedule.route as any; 
    const trainDoc = schedule.train as any;

    const scheduleWithDetails: ScheduleWithDetails = {
      _id: schedule._id.toString(),
      trainNumber: trainDoc?.trainNumber || '',
      trainName: trainDoc?.name || trainDoc?.trainName || '',
      train: {
        id: trainDoc?._id?.toString() || '',
        name: trainDoc?.name || trainDoc?.trainName || '',
        number: trainDoc?.trainNumber || '',
        classes: (trainDoc?.classes || []).map((tc: any) => ({
          id: tc._id.toString(),
          name: tc.className,
          code: tc.classCode,
          baseFare: tc.basePrice || 0,
          capacity: tc.capacity || 0
        }))
      },
      route: {
        id: routeDoc?._id?.toString() || '',
        name: `${routeDoc?.fromStation?.stationName || ''} to ${routeDoc?.toStation?.stationName || ''}`,
        distance: routeDoc?.distance || 0,
        duration: routeDoc?.estimatedDuration || '0h 0m',
        baseFare: routeDoc?.baseFare || 0,
        fromStation: routeDoc?.fromStation || null,
        toStation: routeDoc?.toStation || null
      },
      availableClasses: availableClassesForUI.map(ac => ({
        className: ac.className,
        classCode: ac.classCode,
        name: ac.className,
        code: ac.classCode,
        baseFare: ac.basePrice,
        availableSeats: ac.availableSeats,
        fare: ac.fare
      })),
      date: schedule.date.toISOString(),
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      actualDepartureTime: schedule.actualDepartureTime,
      actualArrivalTime: schedule.actualArrivalTime,
      delayReason: schedule.delayReason,
      duration: schedule.duration || schedule.calculatedDuration || '0h 0m',
      distance: routeDoc?.distance || 0,
      platform: schedule.platform || 'TBA',
      status: schedule.status as ScheduleStatus,
      isActive: schedule.isActive ?? true,
      departureStation: routeDoc?.fromStation || null,
      arrivalStation: routeDoc?.toStation || null
    };

    return NextResponse.json({ 
      success: true, 
      data: scheduleWithDetails 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ 
      success: false, 
      message: errorMessage 
    }, { status: 500 });
  }
} 