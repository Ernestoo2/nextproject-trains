import {
  ApiResponse,
  TrainClass,
  TripType,
  Station,
  SearchParams,
} from "../_types/api.types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return {
        success: false,
        data: null as T,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  }

  // Train Classes
  async getTrainClasses(): Promise<ApiResponse<TrainClass[]>> {
    const response = await fetch("/api/train-classes");
    return response.json();
  }

  // Trip Types
  async getTripTypes(): Promise<ApiResponse<TripType[]>> {
    const response = await fetch("/api/trip-types");
    return response.json();
  }

  // Stations
  async getStations(): Promise<ApiResponse<Station[]>> {
    const response = await fetch("/api/stations");
    return response.json();
  }
}

export const apiService = new ApiService();
