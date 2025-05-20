import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/mongodb/connect"
import { Booking } from "@/utils/mongodb/models/Booking";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth/next-auth";

//app/api/booking/[bookingId]/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectDB();
    const booking = await Booking.findById(params.bookingId);
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
  { params }: { params: { bookingId: string } }
) {
  try {
    const body = await request.json();
    await connectDB();
    const booking = await Booking.findByIdAndUpdate(params.bookingId, body, { new: true });
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
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectDB();
    const booking = await Booking.findByIdAndDelete(params.bookingId);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
