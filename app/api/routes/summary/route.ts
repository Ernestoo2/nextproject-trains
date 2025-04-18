import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Route } from "@/utils/mongodb/models/Route";
import { Schedule } from "@/utils/mongodb/models/Schedule";
 
export async function GET() {
  try {
    // Connect to the database first to ensure models are registered
    await connectDB();
    
    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get routes with their stations and available classes
    const routes = await Route.find({ isActive: true })
      .populate('fromStation')
      .populate('toStation')
      .populate('availableClasses')
      .limit(9); // Show more routes

    const summaries = [];

    for (const route of routes) {
      // Get next available schedule for this route
      const nextSchedule = await Schedule.findOne({
        route: route._id,
        date: {
          $gte: today
        },
        isActive: true,
        status: 'SCHEDULED'
      })
      .sort({ date: 1, departureTime: 1 });

      if (nextSchedule) {
        // Get class codes
        const availableClasses = (route.availableClasses as any[]).map(cls => cls.code);

        summaries.push({
          fromStation: (route.fromStation as any).name,
          toStation: (route.toStation as any).name,
          distance: route.distance,
          estimatedDuration: route.estimatedDuration,
          baseFare: route.baseFare,
          availableClasses,
          nextSchedule: {
            departureTime: nextSchedule.departureTime,
            arrivalTime: nextSchedule.arrivalTime,
            availableSeats: nextSchedule.availableSeats
          }
        });
      }
    }

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error("Error fetching route summaries:", error);
    return NextResponse.json(
      { error: "Failed to fetch route summaries" },
      { status: 500 }
    );
  }
} 