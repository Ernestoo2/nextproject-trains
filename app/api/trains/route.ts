// app/api/trains/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/app/utils/mongodb/connect';
import { Train } from '@/app/utils/mongodb/models/Train';
import { trainData } from '@/app/api/api';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const trainId = searchParams.get('trainId');

    // If using mock data (numeric IDs)
    if (trainId && !mongoose.Types.ObjectId.isValid(trainId)) {
      const mockTrain = trainData.find(t => t.id === Number(trainId));
      if (!mockTrain) {
        return NextResponse.json(
          { success: false, message: 'Train not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: mockTrain });
    }

    // If using MongoDB (ObjectIds)
    await connectDB();
    if (trainId) {
      const train = await Train.findById(trainId);
      if (!train) {
        return NextResponse.json(
          { success: false, message: 'Train not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: train });
    }

    // Return mock data if no MongoDB data exists
    const trains = await Train.find({ isActive: true });
    if (trains.length === 0) {
      return NextResponse.json({ success: true, data: trainData });
    }
    
    return NextResponse.json({ success: true, data: trains });
  } catch (error) {
    console.error('Error fetching trains:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch trains' },
      { status: 500 }
    );
  }
}