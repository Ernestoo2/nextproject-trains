import { ApiResponse } from "@/types/shared/api";
import { UnifiedTrainDetails as TrainDetails } from "@/types/shared/trains";
import { TravelFormState } from '@/types/shared/booking';

export let trainData: TrainDetails[] = [
  {
    _id: '1',
    trainName: "12430 - PH ENUGU",
    trainNumber: "12430",
    routes: [{
      station: {
        _id: "1",
        name: "Port Harcourt",
        code: "PH",
      },
      arrivalTime: "07:25",
      departureTime: "11:25",
      day: 1
    }],
    classes: [{
      _id: "1",
      name: "First Class",
      code: "FC",
    }],
    isActive: true,
  },
  {
    _id: '2',
    trainName: "12320 - EBLE",
    trainNumber: "12320",
    routes: [{
      station: {
        _id: "2",
        name: "Enugu",
        code: "ENU",
      },
      arrivalTime: "07:25",
      departureTime: "11:25",
      day: 1
    }],
    classes: [{
      _id: "2",
      name: "Business",
      code: "BC",
    }],
    isActive: true,
  },
];

export const getTravelRoutes = (): Promise<ApiResponse<TravelFormState[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [],
        message: "Travel routes fetched successfully",
      });
    }, 5000);
  });
};

export const fetchTravelRoutes = async (): Promise<
  ApiResponse<TravelFormState[]>
> => {
  // Simulating an API request with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [],
        message: "Travel routes fetched successfully",
      });
    }, 1000); // 1 second delay to simulate API response time
  });
};

export const updateTravleRoute = (
  id: number,
  updatedRoute: Partial<TravelFormState>,
): Promise<ApiResponse<TravelFormState[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [],
        message: "Travel route updated successfully",
      });
    }, 3000);
  });
};

export const deleteTravelRoute = (
  id: number,
): Promise<ApiResponse<TravelFormState[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        data: [],
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
      trainData = trainData.filter((train) => train._id !== id.toString());
      resolve({
        success: true,
        data: trainData,
        message: "Train details deleted successfully",
      });
    }, 2000);
  });
};
