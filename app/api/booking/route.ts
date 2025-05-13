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
import { connectDB } from "@/utils/mongodb/connect";
import {
  BookingDocument,
  BookingStatus,
  BOOKING_STATUS,
  Gender,
  GENDER,
  Passenger,
  PAYMENT_STATUS,
  BERTH_PREFERENCES,
} from "@/types/booking.types";
import { z } from "zod";

const bookingState = new Map();

interface BookingListResponse {
  bookings: BookingDocument[];
  totalPages: number;
  currentPage: number;
  totalBookings: number;
}

interface QueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  status?: BookingStatus;
  fromDate?: string;
  toDate?: string;
  userId?: string;
  trainId?: string;
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

interface BookingUpdateData {
  status?: BookingStatus;
  travelDate?: string;
  passengers?: Passenger[];
  specialRequests?: string[];
  cancellationReason?: string;
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

function validateBookingData(data: BookingData): ValidationResponse {
  const errors: Array<{ field: string; message: string }> = [];

  if (!data.scheduleId) {
    errors.push({ field: "scheduleId", message: "Schedule ID is required" });
  }

  if (
    !data.passengers ||
    !Array.isArray(data.passengers) ||
    data.passengers.length === 0
  ) {
    errors.push({
      field: "passengers",
      message: "At least one passenger is required",
    });
  } else {
    // Validate each passenger
    data.passengers.forEach((passenger, index) => {
      const passengerValidation = validatePassenger(passenger);
      if (!passengerValidation.isValid && passengerValidation.errors) {
        passengerValidation.errors.forEach((error) => {
          errors.push({
            field: `passengers[${index}].${error.field}`,
            message: error.message,
          });
        });
      }
    });
  }

  if (!data.class) {
    errors.push({ field: "class", message: "Train class is required" });
  }

  if (!data.travelDate) {
    errors.push({ field: "travelDate", message: "Travel date is required" });
  } else {
    const travelDate = new Date(data.travelDate);
    const today = new Date();
    if (travelDate < today) {
      errors.push({
        field: "travelDate",
        message: "Travel date cannot be in the past",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

function validateUpdateData(data: BookingUpdateData): ValidationResponse {
  const errors: Array<{ field: string; message: string }> = [];

  if (data.status && !Object.values(BOOKING_STATUS).includes(data.status)) {
    errors.push({ field: "status", message: "Invalid booking status" });
  }

  if (data.travelDate) {
    const travelDate = new Date(data.travelDate);
    const today = new Date();
    if (travelDate < today) {
      errors.push({
        field: "travelDate",
        message: "Travel date cannot be in the past",
      });
    }
  }

  if (data.passengers) {
    if (!Array.isArray(data.passengers) || data.passengers.length === 0) {
      errors.push({
        field: "passengers",
        message: "At least one passenger is required",
      });
    } else {
      data.passengers.forEach((passenger, index) => {
        const passengerValidation = validatePassenger(passenger);
        if (!passengerValidation.isValid && passengerValidation.errors) {
          passengerValidation.errors.forEach((error) => {
            errors.push({
              field: `passengers[${index}].${error.field}`,
              message: error.message,
            });
          });
        }
      });
    }
  }

  if (data.specialRequests && !Array.isArray(data.specialRequests)) {
    errors.push({
      field: "specialRequests",
      message: "Special requests must be an array",
    });
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Helper function to validate email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate phone
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
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
      .limit(queryParams.limit);

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

export async function POST(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    await connectDB();
    const body = await request.json();

    const validationResult = bookingCreateSchema.safeParse(body);
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

    const validatedData = validationResult.data;

    // Generate PNR
    const pnr = `PNR${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()}`;

    const booking = await Booking.create({
      ...validatedData,
      pnr,
      status: BOOKING_STATUS.INITIATED,
      paymentStatus: PAYMENT_STATUS.PENDING,
      isActive: true,
    });

    await booking.populate([
      { path: "userId", select: "email name" },
      { path: "scheduleId", select: "departureTime arrivalTime date" },
    ]);

    const response: ApiResponse<BookingDocument> = {
      success: true,
      data: booking,
      message: "Booking created successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
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
