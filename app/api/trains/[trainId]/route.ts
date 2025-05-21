import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getTrainDetails } from "@/api/api";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "@/types/shared/api"; 
import { authOptions } from "@/utils/auth/next-auth";
import { TrainDetails } from "@/types/shared";

export async function GET(
  request: any,
  { params }: any
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      const response: ApiErrorResponse = {
        success: false,
        error: "Unauthorized",
        status: 401,
        message: "You must be logged in to access this resource",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response = await getTrainDetails();

    if (!response.success || !response.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch train details",
          status: 400,
          message: response.message || "Unknown error occurred",
        },
        { status: 400 }
      );
    }

    const train = response.data.find((t) => t._id === params.trainId);

    if (!train) {
      return NextResponse.json(
        {
          success: false,
          error: "Train not found",
          status: 404,
          message: `No train found with ID ${params.trainId}`,
        },
        { status: 404 }
      );
    }

    const successResponse: ApiSuccessResponse<TrainDetails> = {
      success: true,
      data: train as unknown as TrainDetails,
      message: "Train details fetched successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching train details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        status: 500,
        message: "An unexpected error occurred while fetching train details",
      },
      { status: 500 }
    );
  }
}
