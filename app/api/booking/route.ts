import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  PaginatedApiResponse,
} from "@/types/shared/api";
import { authOptions } from "@/utils/auth/next-auth";
import { Booking } from "@/utils/mongodb/models/Booking";
import {
  authMiddleware,
  validateRequiredParams,
  handleApiError,
} from "@/utils/api/middleware";
import connectDB from "@/utils/mongodb/connect";
import {
  BookingDocument,
  BookingStatus,
  BOOKING_STATUS, 
  GENDER,
  Passenger,
  PAYMENT_STATUS,
  BERTH_PREFERENCES,
} from "@/types/booking.types";
import { z } from "zod";
import { NextRequest } from "next/server";
import { Schedule } from "@/utils/mongodb/models/Schedule";  
import { PaymentHistory } from "@/utils/mongodb/models/PaymentHistory";

 
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
  name: z.string().min(2).max(100),
  age: z.number().int().min(0).max(120),
  gender: z.enum(Object.values(GENDER) as [string, ...string[]]),
  seatNumber: z.string().optional(),
  berthPreference: z
    .enum(Object.values(BERTH_PREFERENCES) as [string, ...string[]])
    .optional(),
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



export async function GET(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);

    const queryResult = querySchema.safeParse({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      status: searchParams.get("status"),
      fromDate: searchParams.get("fromDate"),
      toDate: searchParams.get("toDate"),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: queryResult.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const queryParams = queryResult.data;
    const query: Record<string, any> = { isActive: true };

    if (queryParams.status) {
      query.status = queryParams.status;
    }

    if (queryParams.fromDate || queryParams.toDate) {
      query.createdAt = {};
      if (queryParams.fromDate) {
        query.createdAt.$gte = new Date(queryParams.fromDate);
      }
      if (queryParams.toDate) {
        query.createdAt.$lte = new Date(queryParams.toDate);
      }
    }

    const skip = (queryParams.page - 1) * queryParams.limit;
    const totalCount = await Booking.countDocuments(query);
    const totalPages = Math.ceil(totalCount / queryParams.limit);

    const bookings = await Booking.find(query)
      .populate([
        { path: "userId", select: "email name" },
        { path: "scheduleId", select: "departureTime arrivalTime date" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(queryParams.limit)
      .lean() as unknown as BookingDocument[];

    const response: PaginatedApiResponse<BookingListResponse> = {
      success: true,
      data: {
        bookings,
        totalPages,
        currentPage: queryParams.page,
        totalBookings: totalCount,
      },
      message: "Bookings fetched successfully",
      pagination: {
        currentPage: queryParams.page,
        totalPages,
        totalItems: totalCount,
        limit: queryParams.limit,
        hasMore: queryParams.page * queryParams.limit < totalCount,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      scheduleId,
      class: trainClass,
      passengers,
      fare,
    } = body;

    // Validate required fields
    if (!scheduleId || !trainClass || !passengers || !fare) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate PNR
    const pnr = `PNR${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    // Create booking with payment data
    const booking = new Booking({
      userId: session.user.id,
      scheduleId,
      class: trainClass,
      passengers: passengers.map((p: passenger) => ({
        firstName: p.name.split(' ')[0],
        lastName: p.name.split(' ')[1] || '',
        age: p.age,
        gender: p.gender,
        type: "ADULT", // Default to ADULT if not specified
        nationality: "Nigerian", // Default to Nigerian if not specified
        berthPreference: p.berthPreference,
        seatNumber: p.seatNumber
      })),
      fare: {
        base: fare.base,
        taxes: fare.taxes,
        total: fare.total,
        discount: fare.discount || 0
      },
      pnr,
      status: BOOKING_STATUS.CONFIRMED,
      paymentStatus: PAYMENT_STATUS.COMPLETED,
    });

    await booking.save();

    // Save payment history
    const payment = new PaymentHistory({
      booking: booking._id,
      user: session.user.id,
      amount: fare.total,
      method: "CREDIT_CARD", // Default to CREDIT_CARD, update based on actual payment method
      transactionId: `TXN${Date.now()}`,
      status: "COMPLETED",
      metadata: {
        trainNumber: booking.trainNumber,
        departureStation: booking.departureStation,
        arrivalStation: booking.arrivalStation,
        class: trainClass,
      },
    });

    await payment.save();

    // Update available seats
    await Schedule.findByIdAndUpdate(scheduleId, {
      $inc: { [`availableSeats.${trainClass}`]: -passengers.length }
    });

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create booking",
      },
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
    [BOOKING_STATUS.INITIATED]: [
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
