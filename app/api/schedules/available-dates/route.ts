import { NextResponse } from "next/server";  
import { Schedule } from "@/utils/mongodb/models/Schedule";
import connectDB from "@/utils/mongodb/connect";

export async function GET() {
  try {
    await connectDB();

    // Get all unique dates from schedules
    const availableDates = await Schedule.aggregate([
      {
        $project: {
          // First ensure we have a valid date by parsing the string
          parsedDate: {
            $dateFromString: {
              dateString: "$departureTime",
              format: "%Y-%m-%dT%H:%M:%S.%LZ", // ISO format
              onError: null, // Return null for invalid dates
              onNull: null
            }
          }
        }
      },
      {
        // Filter out any null dates
        $match: {
          parsedDate: { $ne: null }
        }
      },
      {
        // Convert to string format we want
        $project: {
          dateStr: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$parsedDate"
            }
          }
        }
      },
      {
        // Group by the date string
        $group: {
          _id: "$dateStr"
        }
      },
      {
        // Sort the dates
        $sort: { _id: 1 }
      }
    ]);

    // Transform the dates into a more usable format
    const formattedDates = availableDates.map(date => ({
      date: date._id
    }));

    return NextResponse.json({
      success: true,
      data: formattedDates
    });
  } catch (error) {
    console.error("Error fetching available dates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch available dates"
      },
      { status: 500 }
    );
  }
} 