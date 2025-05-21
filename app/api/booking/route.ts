import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  ApiResponse,
} from "@/types/shared/api";
import { authOptions } from "@/utils/auth/next-auth";
import { Booking } from "@/utils/mongodb/models/Booking";
import {
  authMiddleware,
  validateRequiredParams,
  handleApiError,
} from "@/utils/api/middleware";
import connectDB from "@/utils/mongodb/connect";

import { z } from "zod";
import { NextRequest } from "next/server";
import { Schedule } from "@/utils/mongodb/models/Schedule";  
import { PaymentHistory } from "@/utils/mongodb/models/PaymentHistory";
import { BOOKING_STATUS, BookingDocument, GENDER, Passenger, PAYMENT_STATUS } from "@/types/shared/booking.types";
import { Train } from "@/utils/mongodb/models/Train";

 
interface BookingListResponse {
  bookings: BookingDocument[];
  totalPages: number;
  currentPage: number;
  totalBookings: number;
}
 
 

interface ValidationResponse {
  isValid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

interface BookingData {
  scheduleId: string;
  passengers: Passenger[];
  class: string;
  travelDate: string;
  userId: string;
  trainId: string;
  routeId: string;
  classId: string;
  totalAmount: number;
  [key: string]: any;
}



// Validation Schemas
const passengerSchema = z.object({
  firstName: z.string().min(2).max(100),
  lastName: z.string().min(2).max(100),
  age: z.number().int().min(0).max(120),
  gender: z.enum(Object.values(GENDER) as [string, ...string[]]),
  type: z.enum(["ADULT", "CHILD", "INFANT"]),
  nationality: z.string(),
  selectedClassId: z.string(),
  seatNumber: z.string().optional(),
  berthPreference: z.enum(["LOWER", "MIDDLE", "UPPER", "SIDE_LOWER", "SIDE_UPPER"]).default("LOWER"),
});
type passenger = { name: string; age: number; gender: string; berthPreference: string; seatNumber: string; }
const fareSchema = z.object({
  base: z.number().min(0),
  taxes: z.number().min(0),
  total: z.number().min(0),
  discount: z.number().min(0).optional(),
  promoCode: z.string().optional(),
});

const bookingCreateSchema = z.object({
  scheduleId: z.string().length(24),
  passengers: z.array(passengerSchema).min(1).max(6),
  class: z.string(),
  fare: fareSchema,
});

const bookingUpdateSchema = z.object({
  bookingId: z.string().length(24),
  status: z
    .enum(Object.values(BOOKING_STATUS) as [string, ...string[]])
    .optional(),
  paymentStatus: z
    .enum(Object.values(PAYMENT_STATUS) as [string, ...string[]])
    .optional(),
  passengers: z.array(passengerSchema).min(1).max(6).optional(),
  transactionId: z.string().optional(),
});

const querySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  status: z
    .enum(Object.values(BOOKING_STATUS) as [string, ...string[]])
    .optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

function validatePassenger(passenger: Partial<Passenger>): ValidationResponse {
  const errors: Array<{ field: string; message: string }> = [];

  if (!("name" in passenger) || !passenger.name) {
    errors.push({ field: "name", message: "Name is required" });
  }

  if (!passenger.age || passenger.age < 0 || passenger.age > 120) {
    errors.push({ field: "age", message: "Valid age is required (0-120)" });
  }

  if (!passenger.gender || !Object.values(GENDER).includes(passenger.gender)) {
    errors.push({ field: "gender", message: "Valid gender is required" });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}


export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "scheduleId",
        select: "train route departureTime arrivalTime date",
        populate: [
          {
            path: "route",
            select: "fromStation toStation",
            populate: [
              {
                path: "fromStation",
                select: "stationName stationCode",
              },
              {
                path: "toStation",
                select: "stationName stationCode",
              },
            ],
          }
        ]
      }).lean();

    const bookingsWithTrainNames = await Promise.all(bookings.map(async (booking: any) => {
      if (booking.scheduleId && booking.scheduleId.train) {
        const train = await Train.findById(booking.scheduleId.train).select("trainName").lean();
        if (train) {
          const trainData = train as { trainName?: string };
          if (trainData.trainName) {
            booking.scheduleId.trainName = trainData.trainName;
          }
          booking.scheduleId.train = train as any;
        }
      }
      return booking;
    }));

    return NextResponse.json({
      success: true,
      data: bookingsWithTrainNames
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.scheduleId || !body.passengers || !body.fare || !body.class) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate a unique PNR
    const pnr = `PNR${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Fetch the schedule to check and update available seats
    const schedule = await Schedule.findById(body.scheduleId);

    if (!schedule) {
      return NextResponse.json(
        { success: false, message: "Schedule not found" },
        { status: 404 }
      );
    }

    const requestedClass = body.class;
    const numberOfPassengers = body.passengers.length;
    const requestedClassId = body.passengers[0]?.selectedClassId;

    // Check if enough seats are available for the requested class ID
    if (!requestedClassId || !schedule.availableSeats.has(requestedClassId) || schedule.availableSeats.get(requestedClassId)! < numberOfPassengers) {
        return NextResponse.json(
            { success: false, message: `Not enough seats available for ${requestedClass} class` },
            { status: 400 }
        );
    }

    // Assign basic sequential seat numbers and update available seats (using class code for display)
    const updatedPassengers = body.passengers.map((p: any, index: number) => ({
        ...p,
        // Use the class code string for the display seat number
        seatNumber: `${requestedClass}-${index + 1}`, // Basic seat assignment using class code
    }));

    // Decrement available seats for the requested class ID
    schedule.availableSeats.set(requestedClassId, schedule.availableSeats.get(requestedClassId)! - numberOfPassengers);
    await schedule.save();


    const booking = await Booking.create({
      userId: session.user.id,
      scheduleId: body.scheduleId,
      pnr,
      status: BOOKING_STATUS.PENDING, // Or BOOKING_STATUS.CONFIRMED if payment is confirmed
      paymentStatus: PAYMENT_STATUS.PENDING, // Or PAYMENT_STATUS.COMPLETED if payment is confirmed
      passengers: updatedPassengers, // Use updated passengers with seat numbers
      fare: {
        base: body.fare.base || 0,
        taxes: body.fare.taxes || 0,
        total: body.fare.total || 0,
        discount: body.fare.discount || 0,
        promoCode: body.fare.promoCode
      },
      class: body.class,
      metadata: {
        travelDate: body.travelDate,
        trainId: body.trainId,
        routeId: body.routeId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create booking", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    await connectDB();
    const body = await request.json();

    const validationResult = bookingUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: validationResult.error.errors
            .map((e) => e.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const { bookingId, ...updates } = validationResult.data;

    // Find the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          status: 404,
          message: "Booking not found",
        },
        { status: 404 }
      );
    }

    // Validate status transition if status is being updated
    if (
      updates.status &&
      !isValidStatusTransition(booking.status, updates.status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: `Invalid status transition from ${booking.status} to ${updates.status}`,
        },
        { status: 400 }
      );
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { $set: updates },
      { new: true }
    ).populate([
      { path: "userId", select: "email name" },
      { path: "scheduleId", select: "departureTime arrivalTime date" },
    ]);

    const response: ApiResponse<BookingDocument> = {
      success: true,
      data: updatedBooking,
      message: "Booking updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

// Helper function to validate status transitions
function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  const validTransitions: Record<string, string[]> = {
    [BOOKING_STATUS.PENDING]: [
      BOOKING_STATUS.CONFIRMED,
      BOOKING_STATUS.CANCELLED,
    ],
    [BOOKING_STATUS.CONFIRMED]: [
      BOOKING_STATUS.COMPLETED,
      BOOKING_STATUS.CANCELLED,
    ],
    [BOOKING_STATUS.COMPLETED]: [],
    [BOOKING_STATUS.CANCELLED]: [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
}
