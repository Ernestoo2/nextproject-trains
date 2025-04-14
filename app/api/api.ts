import {
  ApiResponse,
  TrainDetails,
  TravelRoute,
  initialTravelData,
} from "./types/types";

export let trainData: TrainDetails[] = [
  {
    id: 1,
    trainName: "12430 - PH ENUGU",
    runsOn: "Everyday",
    startDate: "Nov 16",
    endDate: "Nov 17",
    departureTime: "11:25 pm",
    arrivalTime: "7:25 am",
    departureStation: "Port Harcourt, Rivers",
    arrivalStation: "Enugu, Enugu",
    duration: "8 hours",
  },
  {
    id: 2,
    trainName: "12320 - EBLE",
    runsOn: "Everyday",
    startDate: "Nov 16",
    endDate: "Nov 17",
    departureTime: "11:25 pm",
    arrivalTime: "7:25 am",
    departureStation: "Port Harcourt, Rivers",
    arrivalStation: "Enugu, Enugu",
    duration: "8 hours 50 minutes",
  },
  {
    id: 3,
    trainName: "12320 - EBLE",
    runsOn: "Everyday",
    departureTime: "11:25 pm",
    arrivalTime: "7:25 am",
    startDate: "Nov 16",
    endDate: "Nov 17",
    departureStation: "Port Harcourt, Rivers",
    arrivalStation: "Enugu, Enugu",
    duration: "8 hours 30 minutes",
  },
  {
    id: 4,
    trainName: "12320 - EBLE",
    runsOn: "Everyday",
    startDate: "Nov 16",
    endDate: "Nov 17",
    departureTime: "11:25 pm",
    arrivalTime: "7:25 am",
    departureStation: "Port Harcourt, Rivers",
    arrivalStation: "Enugu, Enugu",
    duration: "8 hours 20 minutes",
  },
];
let travelData: TravelRoute[] = initialTravelData;
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

export const updateTravleRoute = (
  id: number,
  updatedRoute: Partial<TravelRoute>,
): Promise<ApiResponse<TravelRoute[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      travelData = travelData.map((route) =>
        route.id === id ? { ...route, ...updatedRoute } : route,
      );
      resolve({
        success: true,
        data: travelData,
        message: "Travel route updated successfully",
      });
    }, 3000);
  });
};

export const deleteTravelRoute = (
  id: number,
): Promise<ApiResponse<TravelRoute[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      travelData = travelData.filter((route) => route.id !== id);
      resolve({
        success: true,
        data: travelData,
        message: "Travel route deleted successfully",
      });
    }, 2000);
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
