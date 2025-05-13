import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { ApiResponse } from "@/types/shared/api";
import { authOptions } from "@/utils/auth/next-auth";
import { connectDB } from "@/utils/mongodb/connect"; 
import type { TrainClassDocument } from "@/utils/mongodb/models/TrainClass";
import { CLASS_TYPE, TrainClass } from '@/utils/mongodb/models/TrainClass';
import { handleApiError } from "@/utils/api/middleware";
import { TrainClassResponse } from "@/types/shared/trains";
// Create a type-safe array of class types
const CLASS_TYPE_VALUES = [
  CLASS_TYPE.FIRST_CLASS,
  CLASS_TYPE.BUSINESS,
  CLASS_TYPE.ECONOMY,
  CLASS_TYPE.SLEEPER,
  CLASS_TYPE.STANDARD,
] as const;

// Validation Schemas
const trainClassCreateSchema = z.object({
  className: z.string().min(3).max(50),
  classCode: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/),
  classType: z.enum(CLASS_TYPE_VALUES),
  basePrice: z.number().min(0),
  capacity: z.number().int().min(1).max(100),
  amenities: z.array(z.string()).optional(),
  description: z.string().min(10).max(500),
});

export async function GET() {
  try {
    await connectDB();
    
    const trainClasses = await TrainClass.find({ isActive: true });
    
    if (!trainClasses || trainClasses.length === 0) {
      return NextResponse.json(
        { error: "No train classes found" },
        { status: 404 }
      );
    }

    // Transform the data to match the expected response type
    const transformedClasses: TrainClassResponse[] = trainClasses.map((cls) => ({
      _id: cls._id.toString(),
      code: cls.classCode,
      name: cls.className,
      classType: cls.classType,
      basePrice: cls.basePrice,
      baseFare: cls.basePrice,
      capacity: cls.capacity,
      amenities: cls.amenities,
      description: cls.description,
      isActive: cls.isActive,
    }));

    return NextResponse.json(transformedClasses);
  } catch (error) {
    console.error("Error fetching train classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch train classes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          status: 401,
          message: "You must be logged in to access this resource",
        },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();

    const validationResult = trainClassCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: validationResult.error.errors
            .map((e) => e.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check for duplicate class code
    const existingClass = await TrainClass.findOne({
      $or: [
        { classCode: validatedData.classCode },
        { className: validatedData.className },
      ],
    });

    if (existingClass) {
      const isDuplicateCode =
        existingClass.classCode === validatedData.classCode;
      return NextResponse.json(
        {
          success: false,
          error: "Conflict",
          status: 409,
          message: isDuplicateCode
            ? "Class code already exists"
            : "Class name already exists",
        },
        { status: 409 }
      );
    }

    const trainClass = await TrainClass.create({
      ...validatedData,
      isActive: true,
    });

    const response: ApiResponse<TrainClassDocument> = {
      success: true,
      data: trainClass,
      message: "Train class created successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
