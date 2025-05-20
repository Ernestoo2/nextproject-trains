import { NextResponse } from "next/server";
import { Station, StationDocument } from "@/utils/mongodb/models/Station"; 
import connectDB from "@/utils/mongodb/connect"
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/utils/auth/next-auth";
import { handleApiError } from "@/utils/api/middleware";
import { Types } from "mongoose";
import { ApiResponse } from "@/types/shared/api";
// Define the regions as a type-safe array
const VALID_REGIONS = [
  "North",
  "South",
  "East",
  "West",
  "Central",
  "Northeast",
] as const;

// Define the lean document type
type StationLeanResult = {
  _id: Types.ObjectId;
  stationName: string;
  stationCode: string;
  city: string;
  state: string;
  region: string;
  address: string;
  facilities: string[];
  platforms: number;
  isActive: boolean;
  __v: number;
};

// Validation Schemas
const stationCreateSchema = z.object({
  stationName: z.string().min(3).max(100),
  stationCode: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  city: z.string().min(2),
  state: z.string().min(2),
  region: z.enum(VALID_REGIONS),
  address: z.string().min(5),
  facilities: z.array(z.string()).optional(),
  platforms: z.number().int().min(1).max(20),
});

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Default query parameters
    const defaultParams = {
      page: 1,
      limit: 50,
      sortBy: "stationName",
      sortOrder: "asc",
      isActive: true,
    };

    // Parse query parameters with defaults
    const queryParams = {
      page: Number(searchParams.get("page")) || defaultParams.page,
      limit: Number(searchParams.get("limit")) || defaultParams.limit,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || defaultParams.sortBy,
      sortOrder: searchParams.get("sortOrder") || defaultParams.sortOrder,
      isActive: searchParams.get("isActive") !== "false",
      region: searchParams.get("region") || undefined,
      state: searchParams.get("state") || undefined,
    };

    // Build query
    const query: Record<string, any> = { isActive: queryParams.isActive };

    if (queryParams.search) {
      query.$text = { $search: queryParams.search };
    }

    if (queryParams.region) {
      query.region = queryParams.region;
    }

    if (queryParams.state) {
      query.state = queryParams.state;
    }

    // Fetch stations
    const stations = await Station.find(query)
      .sort({ [queryParams.sortBy]: queryParams.sortOrder === "asc" ? 1 : -1 })
      .lean() as StationLeanResult[];

    // Transform the data to match the expected response type
    const transformedStations = stations.map((station) => ({
      _id: station._id.toString(),
      stationName: station.stationName,
      stationCode: station.stationCode,
      city: station.city,
      state: station.state,
      region: station.region,
      address: station.address,
      facilities: station.facilities || [],
      platforms: station.platforms || 1,
      isActive: station.isActive !== false,
    }));

    return NextResponse.json({
      success: true,
      data: {
        stations: transformedStations,
        totalPages: 1,
        currentPage: queryParams.page,
        totalStations: transformedStations.length,
      },
      message: "Stations fetched successfully",
    });
  } catch (error) {
    console.error("Error in stations GET route:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        message: "Failed to fetch stations",
      },
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

    const validationResult = stationCreateSchema.safeParse(body);
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

    // Check for duplicate station code
    const existingStation = await Station.findOne({
      $or: [
        { stationCode: validatedData.stationCode },
        {
          stationName: validatedData.stationName,
          city: validatedData.city,
        },
      ],
    });

    if (existingStation) {
      const isDuplicateCode =
        existingStation.stationCode === validatedData.stationCode;
      return NextResponse.json(
        {
          success: false,
          error: "Conflict",
          status: 409,
          message: isDuplicateCode
            ? "Station code already exists"
            : "Station name already exists in this city",
        },
        { status: 409 }
      );
    }

    const station = await Station.create({
      ...validatedData,
      isActive: true,
    });

    const response: ApiResponse<StationDocument> = {
      success: true,
      data: station,
      message: "Station created successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
