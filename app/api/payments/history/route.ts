import { NextResponse } from "next/server";
import { connectDB } from "../../../utils/mongodb/connect";
import { IPaymentHistory } from "../../../../utils/mongodb/models/PaymentHistory";
import { PaymentHistory as PaymentHistoryModel } from "../../../../utils/mongodb/models/PaymentHistory";

export async function POST(request: Request) {
  try {
    await connectDB();
    const payment: IPaymentHistory = await request.json();

    // Validate required fields
    if (!payment.id || !payment.userId || !payment.amount || !payment.date || !payment.status || !payment.method || !payment.bookingId || !payment.reference) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }

    const newPayment = new PaymentHistoryModel({
      ...payment,
      date: new Date(payment.date)
    });

    await newPayment.save();

    return NextResponse.json({
      success: true,
      message: "Payment history saved successfully"
    });
  } catch (error) {
    console.error("Error saving payment history:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to save payment history"
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 });
    }

    const payments = await PaymentHistoryModel.find({ userId })
      .sort({ date: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      payments: payments.map((payment: IPaymentHistory)  => ({
        ...payment.toObject(),
        date: payment.date.toISOString()
      }))
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch payment history"
    }, { status: 500 });
  }
} 