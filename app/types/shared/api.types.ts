import { Types } from "mongoose";
import type { TrainClass, TrainClassType, Station } from "./base.types";

//app/types/shared/api.types.ts

// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

export interface ApiSuccessResponse<T> extends ApiResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends ApiResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
}

// Pagination Types
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasMore: boolean;
}

export interface PaginatedApiResponse<T> extends ApiSuccessResponse<T> {
  pagination: PaginationMeta;
}

// Query and Filter Types
export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
  populate?: string[];
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Common Status Types
export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type ProcessStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// Utility Types for MongoDB
export interface MongoQueryFilters {
  [key: string]: any;
  _id?: Types.ObjectId;
  isActive?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export type MongoSortOptions = {
  [key: string]: 1 | -1;
};

// API Response Types
export interface TrainClassResponse {
  code: string;
  name: string;
  classType: TrainClassType;
  basePrice: number;
  capacity?: number;
  amenities?: string[];
  description?: string;
  isActive?: boolean;
}

export interface RouteSearchParams {
  fromStationId: string;
  toStationId: string;
  date: string;
  tripType: string;
  classType: string;
  passengers: {
    classType: string;
    adultCount: number;
    childCount: number;
    infantCount: number;
  };
}

export interface PricingDetails {
  baseFare: number;
  tax: number;
  total: number;
}

export interface RouteSearchResponse {
  availableRoutes: Route[];
  pricing: {
    routeId: string;
    classPricing: Record<string, PricingDetails>;
  }[];
}

export interface Route {
  _id: string;
  routeCode: string;
  routeName: string;
  fromStation: Station;
  toStation: Station;
  distance: number;
  estimatedDuration: string;
  baseFare: number;
  availableClasses: TrainClass[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}