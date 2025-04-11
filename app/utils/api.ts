import { TrainDetails } from "../(dashboard)/trains/train-search/_types/train.types";
import { ApiResponse } from "./type";
import { initialTravelData, TravelRoute } from "./type";

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

export const getTrainDetails = (): Promise<ApiResponse<TrainDetails[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: trainData,
        message: "Train details fetched successfully",
      });
    }, 7000);
  });
};

export const addTrainDetails = (
  newTrain: TrainDetails,
): Promise<ApiResponse<TrainDetails[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      trainData = [...trainData, newTrain];
      resolve({
        success: true,
        data: trainData,
        message: "Train details added successfully",
      });
    }, 2000);
  });
};

export const deleteTrainDetails = (
  id: number,
): Promise<ApiResponse<TrainDetails[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      trainData = trainData.filter((train) => train.id !== id);
      resolve({
        success: true,
        data: trainData,
        message: "Train details deleted successfully",
      });
    }, 2000);
  });
};
