import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/mongodb/connect';
import { Schedule } from '@/utils/mongodb/models/Schedule';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromStation = searchParams.get('fromStation');
    const toStation = searchParams.get('toStation');
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    // Build query with proper MongoDB filtering
    const query: any = { isActive: true };

    // Add station filtering to the database query
    if (fromStation) {
      query['route.fromStation'] = fromStation;
    }
    if (toStation) {
      query['route.toStation'] = toStation;
    }

    // Add date filtering
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.date = {
        $gte: startDate,
        $lte: endDate
      };
    }

    // Add status filtering
    if (status && status !== 'all') {
      query.status = status;
    }

    await connectDB();
    
    // Use lean() for better performance when we don't need Mongoose documents
    const schedules = await Schedule.find(query)
      .populate({
        path: 'train',
        select: 'trainName trainNumber -_id'
      })
      .populate({
        path: 'route',
        populate: {
          path: 'fromStation toStation',
          select: 'name code -_id'
        },
        select: 'fromStation toStation distance estimatedDuration baseFare -_id'
      })
      .select('-__v')
      .lean()
      .sort({ departureTime: 1 });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
} 