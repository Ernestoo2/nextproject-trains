import {
  ApiResponse,
  TrainDetails,
  TravelRoute,
  initialTravelData,
} from "./types/types";

const travelData = initialTravelData;
export const getTravelRoutes = (): Promise<ApiResponse<TravelRoute[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: travelData,
        message: "Travel routes fetched successfully",
      });
    }, 5000);
  });
};

export const fetchTravelRoutes = async (): Promise<
  ApiResponse<TravelRoute[]>
> => {
  // Simulating an API request with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: initialTravelData,
        message: "Travel routes fetched successfully",
      });
    }, 1000); // 1 second delay to simulate API response time
  });
};

export const getTrainDetails = async (
  trainId?: string,
): Promise<ApiResponse<TrainDetails[]>> => {
  try {
    const url = trainId ? `/api/trains?trainId=${trainId}` : "/api/trains";

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to fetch train details",
        data: [],
      };
    }

    return {
      success: true,
      data: Array.isArray(data.data) ? data.data : [data.data],
      message: "Train details fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching train details:", error);
    return {
      success: false,
      message: "Failed to fetch train details",
      data: [],
    };
  }
};

// Update these to use fetch calls to API routes instead of direct MongoDB access
export const addTrainDetails = async (
  newTrain: TrainDetails,
): Promise<ApiResponse<TrainDetails[]>> => {
  try {
    const response = await fetch("/api/trains", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTrain),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to add train details",
        data: [],
      };
    }

    return data;
  } catch (error) {
    console.error("Error adding train details:", error);
    return {
      success: false,
      message: "Failed to add train details",
      data: [],
    };
  }
};

export const deleteTrainDetails = async (
  id: string,
): Promise<ApiResponse<TrainDetails[]>> => {
  try {
    const response = await fetch(`/api/trains/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Failed to delete train details",
        data: [],
      };
    }

    return data;
  } catch (error) {
    console.error("Error deleting train details:", error);
    return {
      success: false,
      message: "Failed to delete train details",
      data: [],
    };
  }
};
