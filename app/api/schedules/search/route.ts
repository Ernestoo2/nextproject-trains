import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Schedule, ISchedule } from "@/utils/mongodb/models/Schedule";
import mongoose from "mongoose"; // Import mongoose for ObjectId validation
import { IRoute, IStation } from "@/utils/mongodb/types";
import { ITrain, ITrainClass } from "@/api/types/types";

// Define a more specific type for the populated schedule
interface PopulatedSchedule extends Omit<ISchedule, 'route' | 'train'> {
  _id: mongoose.Types.ObjectId;
  route: (Omit<IRoute, 'fromStation' | 'toStation' | 'availableClasses'> & {
    _id: mongoose.Types.ObjectId;
    fromStation: Pick<IStation, '_id' | 'name' | 'code'>;
    toStation: Pick<IStation, '_id' | 'name' | 'code'>;
    availableClasses: Pick<ITrainClass, '_id' | 'name' | 'code' | 'baseFare'>[];
  }) | null;
  train: (Pick<ITrain, '_id' | 'trainName' | 'trainNumber'>) | null;
  __v: number; // Change from optional (__v?: number) to required (__v: number)
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from"); // Expecting station ID
    const to = searchParams.get("to");     // Expecting station ID
    const date = searchParams.get("date"); // Expecting YYYY-MM-DD

    // Optional parameters for filtering/display
    const classType = searchParams.get("classType"); // e.g., 'SC', 'BC', 'FC'
    const adultCount = parseInt(searchParams.get("adultCount") || "1", 10);
    const childCount = parseInt(searchParams.get("childCount") || "0", 10);
    // Infants might not require seats, adjust logic if needed
    const infantCount = parseInt(searchParams.get("infantCount") || "0", 10);
    const tripType = searchParams.get("tripType"); // e.g., 'one-way', 'return' (currently unused in query)

    // Basic validation
    if (!from || !to || !date) {
      return NextResponse.json(
        { error: "Missing required search parameters: from (ID), to (ID), date" },
        { status: 400 }
      );
    }
    if (!mongoose.Types.ObjectId.isValid(from) || !mongoose.Types.ObjectId.isValid(to)) {
       return NextResponse.json({ error: "Invalid station ID format." }, { status: 400 });
    }
     if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }


    // Convert date string to Date object and set range for the entire day in UTC
    const searchDate = new Date(date + 'T00:00:00.000Z'); // Treat input date as UTC start
    const nextDay = new Date(searchDate);
    nextDay.setUTCDate(searchDate.getUTCDate() + 1);

    // Query schedules by date first
    const queryDate: any = {
      date: {
        $gte: searchDate,
        $lt: nextDay,
      },
      status: { $ne: "CANCELLED" }, // Exclude cancelled schedules
      isActive: true,             // Only find active schedules
    };

    // Find schedules for the date, populating related data
    // Using generic type assertion for populate result temporarily
    const potentialSchedules = await Schedule.find(queryDate)
      .populate<{ route: any }>({ // Use 'any' temporarily or define a deep populated type
        path: 'route',
        match: { // Match the route's from/to stations
            fromStation: new mongoose.Types.ObjectId(from),
            toStation: new mongoose.Types.ObjectId(to),
            isActive: true
        },
        populate: [ // Populate details within the matched route
          { path: 'fromStation', select: 'name code' },
          { path: 'toStation', select: 'name code' },
          { path: 'availableClasses', select: 'name code baseFare', match: { isActive: true } }
        ]
      })
      .populate<{ train: any }>('train', 'trainName trainNumber') // Populate train details
      .sort({ departureTime: 1 }) // Sort by departure time
      .lean(); // Use .lean() for better performance and plain JS objects

    // Filter out schedules where the route didn't match (from/to) or is inactive
    // Assert the type of the resulting array instead of relying solely on the type predicate
    const matchedSchedules = potentialSchedules.filter(
        (schedule) => !!schedule.route // Keep the filtering logic
    ) as PopulatedSchedule[]; // Assert the resulting array type directly


    // Filter further based on available seats for the selected class (if provided)
    // Now TypeScript should trust that schedule.route exists on items in matchedSchedules
    const totalPassengers = adultCount + childCount;
    const finalSchedules = matchedSchedules.filter(schedule => { // schedule is now treated as PopulatedSchedule
        if (!classType || !schedule.availableSeats) {
            return true;
        }
        // Access schedule.route safely (it's guaranteed non-null by the previous filter)
        const seatsAvailable = schedule.availableSeats[classType as keyof typeof schedule.availableSeats];
        return typeof seatsAvailable === 'number' && seatsAvailable >= totalPassengers;
    });


    if (finalSchedules.length === 0) {
      return NextResponse.json({ message: "No schedules matched your criteria (check date, stations, and class availability).", schedules: [] });
    }

    // Transform the response to match the expected format
    const transformedSchedules = finalSchedules.map(schedule => ({
      id: schedule._id.toString(),
      routeId: schedule.route?._id.toString(),
      trainId: schedule.train?._id.toString(),
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      availableSeats: schedule.availableSeats,
      status: schedule.status,
      route: schedule.route ? {
        id: schedule.route._id.toString(),
        fromStation: schedule.route.fromStation,
        toStation: schedule.route.toStation,
        distance: schedule.route.distance,
        baseFare: schedule.route.baseFare,
        estimatedDuration: schedule.route.estimatedDuration,
        availableClasses: schedule.route.availableClasses
      } : null,
      train: schedule.train ? {
        id: schedule.train._id.toString(),
        trainName: schedule.train.trainName,
        trainNumber: schedule.train.trainNumber
      } : null
    }));

    return NextResponse.json({
      schedules: transformedSchedules,
      total: transformedSchedules.length
    });

  } catch (error) {
    console.error("Error in schedule search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateDuration(departureTime: string, arrivalTime: string): string {
  const [depHours, depMinutes] = departureTime.split(':').map(Number);
  const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
  
  let hours = arrHours - depHours;
  let minutes = arrMinutes - depMinutes;
  
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  
  if (hours < 0) {
    hours += 24;
  }
  
  return `${hours}h ${minutes}m`;
} 