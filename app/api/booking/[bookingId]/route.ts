import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect"
import { Booking } from "@/utils/mongodb/models/Booking";
 
//app/api/booking/[bookingId]/route.ts

type RouteContext = {
  params: Promise<{ bookingId: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { bookingId } = await context.params;
    await connectDB();
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { bookingId } = await context.params;
    const body = await request.json();
    await connectDB();
    const booking = await Booking.findByIdAndUpdate(bookingId, body, { new: true });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { bookingId } = await context.params;
    await connectDB();
    const booking = await Booking.findByIdAndDelete(bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
