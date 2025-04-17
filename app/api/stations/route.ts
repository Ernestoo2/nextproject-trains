import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/mongodb/connect';
import { Station } from '@/utils/mongodb/models/Station';
import {  StationType } from '@/types/route.types';

export async function GET() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database, retrieving stations...');
    
    const stations = await Station.find({ isActive: true })
      .select('_id name code city state')
      .lean() as unknown as StationType[]; // Cast to StationType[]
      
    console.log('Retrieved stations:', JSON.stringify(stations, null, 2));
    
    return NextResponse.json({
      success: true,
      data: stations.map((station) => ({
        _id: station._id.toString(),
        name: station.name,
        code: station.code,
        city: station.city,
        state: station.state,
        isActive: station.isActive
      })),
      message: 'Stations retrieved successfully'
    });
  } catch (error) {
    console.error('Error retrieving stations:', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to retrieve stations'
    }, { status: 500 });
  }
}
