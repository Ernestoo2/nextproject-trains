import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect";
import { PaymentHistory } from "@/utils/mongodb/models/PaymentHistory";
import { getServerSession } from "next-auth";
import { z } from "zod";

// Validation schema matching exactly with the payment history JSON structure
const createPaymentSchema = z.object({
  booking: z.string(),
  user: z.string(),
  amount: z.number(),
  currency: z.string().default("NGN"),
  status: z.string(),
  method: z.string(),
  transactionId: z.string(),
  metadata: z.object({
    class: z.string()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { success: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body) {
      return NextResponse.json(
        { success: false, message: "Request body is required" },
        { status: 400 }
      );
    }

    const validatedData = createPaymentSchema.parse(body);

    await connectDB();

    // Check if payment with same transactionId already exists
    const existingPayment = await PaymentHistory.findOne({ 
      transactionId: validatedData.transactionId 
    });

    if (existingPayment) {
      return NextResponse.json({
        success: false,
        message: "Payment with this transaction ID already exists"
      }, { status: 400 });
    }

    const payment = await PaymentHistory.create(validatedData);

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully",
      data: payment
    });
  } catch (error) {
    console.error("Error recording payment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Invalid request data", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Failed to record payment" },
      { status: 500 }
    );
  }
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

    const payments = await PaymentHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("booking");

    return NextResponse.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch payments" },
      { status: 500 }
    );
  }
} 