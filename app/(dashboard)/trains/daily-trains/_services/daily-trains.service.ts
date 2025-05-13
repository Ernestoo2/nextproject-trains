import { DailyTrainsResponse } from "../_types/daily-trains.types";

export async function getDailyTrains(
  date?: string
): Promise<DailyTrainsResponse> {
  try {
    const url = new URL("/api/trains/daily", window.location.origin);
    if (date) {
      url.searchParams.append("date", date);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch daily trains: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: Array.isArray(data.data) ? data.data : [],
      message: data.message || "Successfully fetched daily trains",
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        error instanceof Error ? error.message : "Failed to fetch daily trains",
    };
  }
}
