import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/utils/auth/next-auth";
import connectDB  from "@/utils/mongodb/connect";
import { PaymentHistory } from "@/utils/mongodb/models/PaymentHistory";
import { Types } from "mongoose";
import { PaymentDocument } from "@/utils/mongodb/models/PaymentHistory";
import { PaymentMethod, PaymentStatus } from "@/types/shared/payments";
import mongoose from "mongoose";

interface PopulatedPayment extends Omit<PaymentDocument, 'booking'> {
  _id: Types.ObjectId;
  booking?: {
    pnr?: string;
    trainNumber?: string;
    departureStation?: string;
    arrivalStation?: string;
    class?: string;
    status?: string;
    paymentStatus?: string;
    fare?: {
      base: number;
      taxes: number;
      total: number;
    };
  };
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId: string;
  gatewayResponse?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    // First find all bookings for this user
    const bookings = await mongoose.models.Booking.find({ 
      userId: new Types.ObjectId(userId),
      paymentStatus: "COMPLETED"
    }).lean();

    // Then find payment history entries for these bookings
    const payments = await PaymentHistory.find({
      booking: { $in: bookings.map(b => b._id) }
    })
      .populate({
        path: "booking",
        select: "pnr trainNumber departureStation arrivalStation class status paymentStatus fare",
      })
      .sort({ createdAt: -1 })
      .lean() as unknown as PopulatedPayment[];

    const formattedPayments = payments.map((payment) => ({
      id: payment._id.toString(),
      amount: payment.amount,
      method: payment.method,
      date: payment.createdAt,
      status: payment.status.toLowerCase(),
      metadata: {
        pnr: payment.booking?.pnr,
        trainNumber: payment.booking?.trainNumber,
        departureStation: payment.booking?.departureStation,
        arrivalStation: payment.booking?.arrivalStation,
        class: payment.booking?.class,
        bookingStatus: payment.booking?.status,
        paymentStatus: payment.booking?.paymentStatus,
        fare: payment.booking?.fare,
      },
    }));

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch payment history",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingId, amount, method, transactionId, metadata } = body;

    if (!bookingId || !amount || !method || !transactionId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const payment = new PaymentHistory({
      booking: new Types.ObjectId(bookingId),
      user: new Types.ObjectId(session.user.id),
      amount,
      method,
      transactionId,
      status: "COMPLETED",
      metadata,
    });

    await payment.save();

    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id.toString(),
        amount: payment.amount,
        method: payment.method,
        date: payment.createdAt,
        status: payment.status.toLowerCase(),
        metadata: payment.metadata,
      },
    });
  } catch (error) {
    console.error("Error saving payment history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save payment history",
      },
      { status: 500 }
    );
  }
} 