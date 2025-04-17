 
import { Schedule } from "@/models/Schedule";
import { Station } from "@/models/Station";
import { SearchResponse } from "../_types/train.types";
import { connectDB } from "@/utils/mongodb/connect";

export async function getSchedules(
  fromStationCode: string,
  toStationCode: string,
  date: string
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

    // Convert date string to Date object for comparison
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    // Find schedules for the given route and date
    const schedules = await Schedule.find({
      fromStation: fromStation._id,
      toStation: toStation._id,
      date: searchDate,
      status: { $ne: "cancelled" },
    })
      .sort({ departureTime: 1 })
      .lean();

    return {
      success: true,
      data: schedules,
      fromStation: {
        id: fromStation._id.toString(),
        name: fromStation.name,
        code: fromStation.code,
        city: fromStation.city,
        state: fromStation.state,
      },
      toStation: {
        id: toStation._id.toString(),
        name: toStation.name,
        code: toStation.code,
        city: toStation.city,
        state: toStation.state,
      },
    };
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw new Error("Failed to fetch schedules");
  }
} 