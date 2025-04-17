import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { TrainClass } from "@/utils/mongodb/models/TrainClass";

export async function GET(request: Request) {
  try {
    await connectDB();
    const trainClasses = await TrainClass.find({ isActive: true });

    return NextResponse.json({
      success: true,
      trainClasses: trainClasses.map(cls => ({
        _id: cls._id.toString(),
        name: cls.name,
        code: cls.code,
        baseFare: cls.baseFare,
        isActive: cls.isActive,
      })),
      message: "Train classes fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching train classes:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch train classes" },
      { status: 500 },
    );
  }
}
