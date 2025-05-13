import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Route } from "@/utils/mongodb/models/Route";
import { Station } from "@/utils/mongodb/models/Station";
import { Train } from "@/utils/mongodb/models/Train";
import { TrainClass } from "@/utils/mongodb/models/TrainClass";
import { connectDB } from "@/utils/mongodb/connect";
import type { ScheduleWithDetails, Station as IStation, TrainClass as ITrainClass, ScheduleStatus } from "@/types/shared/trains";
import { handleApiError, createApiResponse, createErrorResponse } from "@/utils/api/middleware";
import { Types } from "mongoose";
// Removed the LeanScheduleWithPopulatedDetails interface as it caused issues

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return createErrorResponse({
        success: false,
        error: "Bad Request",
        status: 400,
        message: "Date parameter is required",
      });
    }

    const schedules = await Schedule.find({
      date: date,
      isActive: true,
    })
    .populate<{ train: { _id: Types.ObjectId, trainNumber: string, trainName: string, classes?: any[] } }>({
      path: "train",
      model: Train,
      select: "_id trainNumber trainName classes" // Ensure _id is selected
    })
    .populate<{ 
        route: { 
          _id: Types.ObjectId, 
          distance: number, 
          baseFare: number,
          estimatedDuration: string,
          fromStation: any, 
          toStation: any, 
          availableClasses: any[] 
        } 
    }>({ 
      path: "route",
      model: Route, 
      populate: [
        {
          path: "fromStation",
          model: Station, 
          select: "_id stationName stationCode city state region address facilities platforms isActive createdAt updatedAt" // Select _id
        },
        {
          path: "toStation",
          model: Station, 
          select: "_id stationName stationCode city state region address facilities platforms isActive createdAt updatedAt" // Select _id
        },
        {
          path: "availableClasses",
          model: TrainClass, 
          select: "_id className classCode classType basePrice capacity amenities description isActive" // Select _id
        }
      ]
    })
    .sort({ departureTime: 1 })
    .lean(); // Keep lean(), but will cast inside map

    if (!schedules || schedules.length === 0) {
        return createApiResponse([], "No schedules found for the specified date.");
    }

    const transformedSchedules: ScheduleWithDetails[] = schedules
      .map((schedule_any): ScheduleWithDetails | null => { // Use schedule_any
        const schedule = schedule_any as any; // Cast to any inside map

        // Perform null checks on potentially missing populated fields
        if (!schedule || !schedule.train || !schedule.route || !schedule.route.fromStation || !schedule.route.toStation || !schedule.route.availableClasses) {
            return null; 
        }
         
        // Transform availableClasses from route, using schedule maps for seats/fare
        const availableClasses = (schedule.route.availableClasses || []).map((cls: any) => {
           const availableSeatsMap = schedule.availableSeats instanceof Map ? schedule.availableSeats : new Map(Object.entries(schedule.availableSeats || {}));
           const fareMap = schedule.fare instanceof Map ? schedule.fare : new Map(Object.entries(schedule.fare || {}));
           return {
             _id: cls._id?.toString() || '',
             className: cls.className,
             classCode: cls.classCode,
             classType: cls.classType,
             baseFare: cls.basePrice ?? 0,
             capacity: cls.capacity,
             amenities: cls.amenities,
             description: cls.description,
             isActive: cls.isActive,
             availableSeats: availableSeatsMap.get(cls._id?.toString()) ?? 0, 
             fare: fareMap.get(cls._id?.toString()) ?? cls.basePrice ?? 0 
           };
        });

        const mapStation = (stationData: any): IStation => ({
             _id: stationData._id?.toString() || '', // Add null check
             stationName: stationData.stationName,
             stationCode: stationData.stationCode,
             city: stationData.city,
             state: stationData.state,
             region: stationData.region,
             address: stationData.address,
             facilities: stationData.facilities || [],
             platforms: stationData.platforms,
             isActive: stationData.isActive,
             createdAt: stationData.createdAt instanceof Date ? stationData.createdAt.toISOString() : (stationData.createdAt || ''),
             updatedAt: stationData.updatedAt instanceof Date ? stationData.updatedAt.toISOString() : (stationData.updatedAt || ''),
        });
        
        const departureStation = mapStation(schedule.route.fromStation);
        const arrivalStation = mapStation(schedule.route.toStation);

        // Construct the final object strictly matching ScheduleWithDetails
        const finalSchedule: ScheduleWithDetails = {
          _id: schedule._id?.toString() || '', 
          trainNumber: schedule.train.trainNumber,
          trainName: schedule.train.trainName,
          train: { 
             id: schedule.train._id?.toString() || '', // Add null check
             name: schedule.train.trainName,
             number: schedule.train.trainNumber,
             classes: (schedule.train.classes || []).map((tc: any) => ({ 
                 id: tc._id?.toString() || '', 
                 name: tc.className, 
                 code: tc.classCode, 
                 baseFare: tc.basePrice,
                 capacity: tc.capacity
                }))
            }, 
          departureStation,
          arrivalStation,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          duration: schedule.duration || schedule.route.estimatedDuration || "",
          date: schedule.date instanceof Date ? schedule.date.toISOString().split('T')[0] : schedule.date?.toString() || '', // Add null check and toString
          platform: schedule.platform || "TBA",
          status: schedule.status,
          availableClasses,
           route: {
              id: schedule.route._id?.toString() || '', 
              name: `${schedule.route.fromStation?.stationName} to ${schedule.route.toStation?.stationName}`, 
              duration: schedule.route.estimatedDuration, 
              fromStation: departureStation, 
              toStation: arrivalStation, 
              distance: schedule.route.distance,
              baseFare: schedule.route.baseFare,
            },
          distance: schedule.route.distance, 
          isActive: schedule.isActive ?? true, 
          actualDepartureTime: schedule.actualDepartureTime,
          actualArrivalTime: schedule.actualArrivalTime,
          delayReason: schedule.delayReason
        };
        return finalSchedule;
      })
      .filter((schedule): schedule is ScheduleWithDetails => schedule !== null); // Filter out nulls from skipped schedules

    return createApiResponse(transformedSchedules, "Daily schedules fetched successfully");

  } catch (error) {
     return createErrorResponse(handleApiError(error));
  }
} 