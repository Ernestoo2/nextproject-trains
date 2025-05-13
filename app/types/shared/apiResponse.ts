import { Types } from "mongoose";

//app/types/shared/apiResponse.ts

export interface BaseApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  status?: number;
}

export interface ApiSuccessResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
}

export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  error: string;
  errors?: ValidationError[];
}

export interface PaginatedApiResponse<T> extends ApiSuccessResponse<T> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
  search?: string;
  populate?: string[];
}

export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper type for MongoDB queries
export interface MongoQueryFilters {
  [key: string]: any;
  _id?: Types.ObjectId;
  isActive?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

// Helper type for MongoDB sort options
export type MongoSortOptions = {
  [key: string]: 1 | -1;
};