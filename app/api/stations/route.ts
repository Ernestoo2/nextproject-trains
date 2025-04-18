import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/mongodb/connect';
import { Station } from '@/utils/mongodb/models/Station';
 
export async function GET() {
  try {
    await connectDB();
    const stations = await Station.find().sort({ name: 1 });
    return NextResponse.json({ success: true, data: stations });
  } catch (error) {
    console.error("Error fetching stations:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch stations" },
      { status: 500 }
    );
  }
}
