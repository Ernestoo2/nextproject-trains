 
import { Schedule } from '@/models/Schedule';
import { connectDB } from '@/utils/mongodb/connect';
import { Station } from '@/utils/mongodb/models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    if (!from || !to || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find stations by name
    const fromStation = await Station.findOne({ name: from });
    const toStation = await Station.findOne({ name: to });

    if (!fromStation || !toStation) {
      return NextResponse.json(
        { success: false, error: 'Invalid station names' },
        { status: 400 }
      );
    }

    // Convert date string to Date object
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    // Find schedules
    const schedules = await Schedule.find({
      fromStation: fromStation._id,
      toStation: toStation._id,
      date: searchDate,
      isActive: true,
    })
      .populate('train')
      .populate('fromStation')
      .populate('toStation')
      .sort({ departureTime: 1 });

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('Error searching trains:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 