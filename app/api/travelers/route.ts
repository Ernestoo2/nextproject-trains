import { NextRequest, NextResponse } from "next/server";

interface TravelerRequest {
  adultCount: number;
  childCount: number;
  infantCount: number;
  classCode: string;
  routeBaseFare: number;
  classBaseFare: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TravelerRequest = await request.json();
    const {
      adultCount,
      childCount,
      infantCount,
      classCode,
      routeBaseFare,
      classBaseFare,
    } = body;

    // Calculate base fares
    const totalPassengers = adultCount + childCount; // Infants travel free
    const perPersonFare = routeBaseFare + classBaseFare;
    const baseTicketFare = perPersonFare * totalPassengers;

    // Calculate taxes (18% of base fare)
    const taxes = Math.round(baseTicketFare * 0.18);

    // Calculate total fare
    const totalFare = baseTicketFare + taxes;

    // Create temporary traveler details
    const travelers = {
      adults: Array(adultCount)
        .fill(null)
        .map((_, i) => ({
          id: `adult-${i + 1}`,
          type: "adult",
          defaultBerth: i === 0 ? "lower" : "middle", // First adult gets lower berth preference
        })),
      children: Array(childCount)
        .fill(null)
        .map((_, i) => ({
          id: `child-${i + 1}`,
          type: "child",
          defaultBerth: "upper",
        })),
      infants: Array(infantCount)
        .fill(null)
        .map((_, i) => ({
          id: `infant-${i + 1}`,
          type: "infant",
          defaultBerth: null, // Infants don't need berths
        })),
    };

    // Return the calculated fares and traveler details
    return NextResponse.json({
      success: true,
      data: {
        fareDetails: {
          perPersonFare,
          baseTicketFare,
          taxes,
          totalFare,
        },
        travelers,
        summary: {
          totalPassengers,
          adultCount,
          childCount,
          infantCount,
          classCode,
        },
      },
    });
  } catch (error) {
    console.error("Error processing travelers:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process travelers",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to validate traveler counts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const adultCount = parseInt(searchParams.get("adultCount") || "0");
  const childCount = parseInt(searchParams.get("childCount") || "0");
  const infantCount = parseInt(searchParams.get("infantCount") || "0");

  const totalPassengers = adultCount + childCount + infantCount;
  const maxPassengers = 6;

  const isValid =
    totalPassengers <= maxPassengers &&
    adultCount >= infantCount && // Each infant needs an adult
    adultCount > 0; // At least one adult required

  return NextResponse.json({
    success: true,
    data: {
      isValid,
      validationMessages: [
        ...(!isValid && totalPassengers > maxPassengers
          ? ["Maximum 6 passengers allowed"]
          : []),
        ...(!isValid && adultCount < infantCount
          ? ["Number of infants cannot exceed number of adults"]
          : []),
        ...(!isValid && adultCount === 0
          ? ["At least one adult passenger required"]
          : []),
      ],
    },
  });
}
