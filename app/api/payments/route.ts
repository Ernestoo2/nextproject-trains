import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/shared/api";
import { authOptions } from "@/utils/auth/next-auth";
import { Payment } from "@/types/shared/database";
import { Types } from "mongoose";
// Convert VALID_PAYMENT_METHODS to a tuple
const VALID_PAYMENT_METHODS = [
  "CREDIT_CARD",
  "DEBIT_CARD",
  "UPI",
  "NET_BANKING",
  "WALLET",
] as const;

type ValidPaymentMethod = typeof VALID_PAYMENT_METHODS[number];

// Update Zod schema for payment validation
const paymentSchema = z.object({
  bookingId: z.string().nonempty("Booking ID is required"),
  amount: z.number().positive("Valid payment amount is required"),
  method: z.enum(VALID_PAYMENT_METHODS),
});

//app/api/payments/route.ts

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      const response: ApiErrorResponse = {
        success: false,
        error: "Unauthorized",
        status: 401,
        message: "You must be logged in to process payment",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const paymentData = await request.json();

    // Validate payment data using Zod
    const validationResult = paymentSchema.safeParse(paymentData);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: validationResult.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data as {
      bookingId: string;
      amount: number;
      method: ValidPaymentMethod;
    };

    // Placeholder logic for creating a payment
    const payment: Payment = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(session.user.id),
      bookingId: new Types.ObjectId(validatedData.bookingId),
      amount: validatedData.amount,
      status: "PENDING",
      transactionId: new Types.ObjectId().toString(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const successResponse: ApiSuccessResponse<Payment> = {
      success: true,
      data: payment,
      message: "Payment processed successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error processing payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        status: 500,
        message: "An unexpected error occurred while processing the payment",
      },
      { status: 500 }
    );
  }
}