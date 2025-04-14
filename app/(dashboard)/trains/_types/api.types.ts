// MongoDB Base Document
export interface BaseDocument {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Train Class Types
export interface TrainClass extends BaseDocument {
  name: string;
  code: string;
  priceMultiplier: number;
  description: string;
  amenities: string[];
  maxPassengers: number;
}

// Trip Types
export interface TripType extends BaseDocument {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

// Station Types
export interface Station extends BaseDocument {
  name: string;
  code: string;
  city: string;
  state: string;
  isActive: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// API Error Types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// API Request Types
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
}

export interface TrainDetails {
  _id: string;
  trainName: string;
  trainNumber: string;
  routes: Array<{
    station: {
      _id: string;
      name: string;
      code: string;
    };
    arrivalTime: string;
    departureTime: string;
    day: number;
  }>;
  classes: Array<{
    _id: string;
    name: string;
    code: string;
  }>;
  isActive: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}
