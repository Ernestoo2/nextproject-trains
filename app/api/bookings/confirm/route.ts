import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Schedule } from "@/utils/mongodb/models/Schedule";
import { Booking } from "@/utils/mongodb/models/Booking"; // Assuming Booking model exists
import { Types } from "mongoose";

interface ConfirmBookingRequest {
  scheduleId: string;
  classId: string; // This is the class code/ID used as a key in availableSeats/fare maps
  numberOfSeatsBooked: number;
  userId?: string; // Optional: for creating a booking record
  travelers?: any[]; // Optional: for creating a booking record
  totalFare?: number; // Optional: for creating a booking record
  pnr?: string; // Optional: for creating a booking record
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body: ConfirmBookingRequest = await request.json();

    const { scheduleId, classId, numberOfSeatsBooked, userId, travelers, totalFare, pnr } = body;

    if (!scheduleId || !classId || !numberOfSeatsBooked || numberOfSeatsBooked <= 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: scheduleId, classId, and numberOfSeatsBooked." },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(scheduleId)) {
      return NextResponse.json({ success: false, message: "Invalid schedule ID format." }, { status: 400 });
    }

    // Fetch the schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return NextResponse.json({ success: false, message: "Schedule not found." }, { status: 404 });
    }

    // Check if the classId exists in availableSeats and has enough seats
    const availableSeatsForClass = schedule.availableSeats.get(classId);
    if (typeof availableSeatsForClass !== 'number') {
      return NextResponse.json(
        { success: false, message: `Class ID '${classId}' not found in schedule's available seats.` },
        { status: 400 }
      );
    }
    if (availableSeatsForClass < numberOfSeatsBooked) {
      return NextResponse.json(
        { success: false, message: `Not enough seats available for class ${classId}. Available: ${availableSeatsForClass}, Requested: ${numberOfSeatsBooked}` },
        { status: 409 } // Conflict
      );
    }

    // Atomically decrement the seat count
    const updateResult = await Schedule.updateOne(
      { _id: scheduleId, [`availableSeats.${classId}`]: { $gte: numberOfSeatsBooked } }, // Conditional update
      { $inc: { [`availableSeats.${classId}`]: -numberOfSeatsBooked } }
    );

    if (updateResult.modifiedCount === 0) {
        // This could happen if seats were booked by another request between check and update
        return NextResponse.json(
            { success: false, message: "Failed to update seat count. Seats might have been booked by another user. Please try again." },
            { status: 409 } // Conflict
        );
    }
    
    // Optional: Create a Booking record
    if (userId && travelers && totalFare && pnr) {
        if (!Types.ObjectId.isValid(userId)) {
            console.warn("Invalid userId format for booking creation, skipping booking record.");
        } else {
            try {
                const newBooking = new Booking({
                    userId: new Types.ObjectId(userId),
                    scheduleId: new Types.ObjectId(scheduleId),
                    trainClass: classId, // Store the classId
                    travelers: travelers,
                    totalFare: totalFare,
                    pnr: pnr,
                    status: "CONFIRMED", // Or your default confirmed status
                    paymentStatus: "PAID", // Assuming payment was successful
                    // Add other necessary fields from your Booking model
                });
                await newBooking.save();
               
            } catch (bookingError) {
                console.error("Error creating booking record:", bookingError);
                // Decide if this should be a critical failure. For now, we'll just log it.
                // Potentially, you might want to try and revert the seat decrement if booking creation is critical and fails.
            }
        }
    }

    return NextResponse.json(
      { success: true, message: "Booking confirmed and seat count updated successfully." },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error confirming booking:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, message: "Failed to confirm booking.", error: errorMessage },
      { status: 500 }
    );
  }
} 