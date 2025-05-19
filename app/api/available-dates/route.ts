import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Schedule } from "@/utils/mongodb/models/Schedule";
// startOfDay, endOfDay from date-fns are not strictly needed here but fine to keep if used elsewhere

export async function GET() {
  try {
    await connectDB();

    const availableDates = await Schedule.aggregate([
      {
        // Ensure the 'date' field exists and is a valid date type
        // MongoDB's $dateToString will error if the field is not a BSON Date, null, or missing.
        // So, we can filter for documents where 'date' is a valid BSON Date.
        $match: {
          date: { $type: "date" } // Ensures 'date' field is a BSON Date type
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d", // Target format
              date: "$date"         // Use the 'date' field directly
            }
          }
        }
      },
      {
        $project: { // Reshape to match expected output { date: "YYYY-MM-DD" }
          _id: 0, // Exclude the default _id from $group stage
          date: "$_id" // Assign the grouped date string to a 'date' field
        }
      },
      {
        $sort: { date: 1 } // Sort by the new 'date' field
      }
    ]);

    // The output of the aggregation will now be an array of objects like: [{ date: "2025-05-22" }, ...]
    // No further mapping is needed if $project stage is used correctly.

    return NextResponse.json({
      success: true,
      data: availableDates // This is now correctly [{ date: "YYYY-MM-DD"}, ...]
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