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
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        message: "Failed to fetch data",
      };
    }
  }

  // Train Classes
  async getTrainClasses(
    params?: SearchParams,
  ): Promise<ApiResponse<TrainClass[]>> {
    const queryParams = params
      ? new URLSearchParams(
          Object.entries(params).filter(([_, v]) => v !== undefined) as [
            string,
            string,
          ][],
        ).toString()
      : "";
    return this.fetchApi<TrainClass[]>(`/train-classes?${queryParams}`);
  }

  // Trip Types
  async getTripTypes(params?: SearchParams): Promise<ApiResponse<TripType[]>> {
    const queryParams = params
      ? new URLSearchParams(
          Object.entries(params).filter(([_, v]) => v !== undefined) as [
            string,
            string,
          ][],
        ).toString()
      : "";
    return this.fetchApi<TripType[]>(`/trip-types?${queryParams}`);
  }

  // Stations
  async getStations(params?: SearchParams): Promise<ApiResponse<Station[]>> {
    const queryParams = params
      ? new URLSearchParams(
          Object.entries(params).filter(([_, v]) => v !== undefined) as [
            string,
            string,
          ][],
        ).toString()
      : "";
    return this.fetchApi<Station[]>(`/stations?${queryParams}`);
  }
}

export const apiService = new ApiService();
