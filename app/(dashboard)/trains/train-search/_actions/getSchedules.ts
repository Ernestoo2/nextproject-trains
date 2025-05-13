import { Station } from "@/models/Station";
import { SearchResponse } from "@/types/shared/searchApi";
import {
  ScheduleWithDetails,
  Station as StationType,
} from "@/types/shared/trains";
import { connectDB } from "@/utils/mongodb/connect";
import { SearchFilters } from "@/(dashboard)/_components/shared/SearchComponents";
import { Schedule } from "models/Schedule";

export async function getSchedules(
  fromStationCode: string,
  toStationCode: string,
  date: string,
  options: Partial<SearchFilters> = {}
): Promise<SearchResponse> {
  try {
    await connectDB();

    // Find stations by their codes
    const [fromStation, toStation] = await Promise.all([
      Station.findOne({ code: fromStationCode }),
      Station.findOne({ code: toStationCode }),
    ]);

    if (!fromStation || !toStation) {
      throw new Error("One or both stations not found");
    }

    const fromStationData: StationType = {
      id: fromStation._id.toString(),
      name: fromStation.stationName || fromStation.name,
      code: fromStation.stationCode || fromStation.code,
      city: fromStation.city,
      state: fromStation.state,
      region: fromStation.region,
      isActive: fromStation.isActive,
    };

    const toStationData: StationType = {
      id: toStation._id.toString(),
      name: toStation.stationName || toStation.name,
      code: toStation.stationCode || toStation.code,
      city: toStation.city,
      state: toStation.state,
      region: toStation.region,
      isActive: toStation.isActive,
    };

    // Convert date string to Date object for comparison
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    // Build query
    const query: Record<string, any> = {
      fromStation: fromStation._id,
      toStation: toStation._id,
      date: searchDate,
      status: { $ne: "CANCELLED" },
    };

    // Add price range filter if provided
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      query.fare = {};
      if (options.minPrice !== undefined) {
        query.fare.$gte = options.minPrice;
      }
      if (options.maxPrice !== undefined) {
        query.fare.$lte = options.maxPrice;
      }
    }

    // Add class type filter if provided
    if (options.classType) {
      query["availableClasses.code"] = options.classType;
    }

    // Calculate pagination
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(50, options.limit || 10));
    const skip = (page - 1) * limit;

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = {};
    if (options.sortBy) {
      sortOptions[options.sortBy] = options.sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions.departureTime = 1; // Default sort
    }

    // Execute query with population
    const [schedules, totalCount] = await Promise.all([
      Schedule.find(query)
        .populate({
          path: "train",
          select: "trainName trainNumber classes",
          populate: {
            path: "classes",
            select: "className code baseFare capacity",
          },
        })
        .populate({
          path: "route",
          select:
            "routeName distance estimatedDuration baseFare fromStation toStation",
          populate: {
            path: "fromStation toStation",
            select: "stationName stationCode city state region isActive",
          },
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Schedule.countDocuments(query),
    ]);

    // Transform schedules to match ScheduleWithDetails type
    const transformedSchedules: ScheduleWithDetails[] = schedules.map(
      (schedule: any) => ({
        _id: schedule._id.toString(),
        train: {
          id: schedule.train._id.toString(),
          name: schedule.train.trainName,
          number: schedule.train.trainNumber,
          classes: schedule.train.classes.map((cls: any) => ({
            id: cls._id.toString(),
            name: cls.className,
            code: cls.code,
            baseFare: cls.baseFare,
            capacity: cls.capacity,
          })),
        },
        route: {
          id: schedule.route._id.toString(),
          name: schedule.route.routeName,
          distance: schedule.route.distance,
          duration: schedule.route.estimatedDuration,
          baseFare: schedule.route.baseFare,
          fromStation: {
            id: schedule.route.fromStation._id.toString(),
            name: schedule.route.fromStation.stationName,
            code: schedule.route.fromStation.stationCode,
            city: schedule.route.fromStation.city,
            state: schedule.route.fromStation.state,
            region: schedule.route.fromStation.region,
            isActive: schedule.route.fromStation.isActive,
          },
          toStation: {
            id: schedule.route.toStation._id.toString(),
            name: schedule.route.toStation.stationName,
            code: schedule.route.toStation.stationCode,
            city: schedule.route.toStation.city,
            state: schedule.route.toStation.state,
            region: schedule.route.toStation.region,
            isActive: schedule.route.toStation.isActive,
          },
        },
        availableClasses: schedule.availableClasses.map((cls: any) => ({
          code: cls.code,
          name: cls.name,
          baseFare: cls.baseFare,
          availableSeats: cls.availableSeats,
        })),
        date: schedule.date.toISOString(),
        departureTime: schedule.departureTime,
        departureStation: fromStationData,
        arrivalStation: toStationData,
        arrivalTime: schedule.arrivalTime,
        duration: schedule.route.estimatedDuration,
        platform: schedule.platform,
        status: schedule.status,
        isActive: schedule.isActive,
      })
    );

    return {
      success: true,
      data: {
        schedules: transformedSchedules,
        totalResults: totalCount,
        page,
        limit,
        hasMore: page * limit < totalCount,
      },
      fromStation: fromStationData,
      toStation: toStationData,
    };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw new Error("Failed to fetch schedules");
  }
}
