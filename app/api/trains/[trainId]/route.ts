import { NextResponse } from "next/server";
import { getTrainDetails } from "@/app/api/api";
import { ApiResponse, TrainDetails } from "@/app/api/types/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/auth/next-auth";

export async function GET(
  request: Request,
  { params }: { params: { trainId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response: ApiResponse<TrainDetails[]> = await getTrainDetails();

    if (!response.success) {
      return new NextResponse(response.message, { status: 400 });
    }

    const train = response.data.find((t) => t.id === parseInt(params.trainId));

    if (!train) {
      return new NextResponse("Train not found", { status: 404 });
    }

    return NextResponse.json(train);
  } catch (error) {
    console.error("Error fetching train details:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
