import { Types } from "mongoose";
import { BookingStatus } from "./booking";
import { PaymentStatus } from "./payments";
import { ScheduleStatus } from "./trains";
import { z } from "zod";

// Base Types
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Response Types
export interface ApiSuccessResponse<T> extends BaseApiResponse {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse extends BaseApiResponse {
  success: false;
  error: string;
  status: number;
  message: string;
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

export interface PaginatedApiResponse<T> {
  success: true;
  data: {
    items: T[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
  message: string;
}

// Query Types
export interface QueryFilters {
  [key: string]: any;
  _id?: Types.ObjectId;
  isActive?: boolean;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: QueryFilters;
  search?: string | null;
  populate?: string[];
}

// Helper Types
export type SortOptions = {
  [key: string]: 1 | -1;
};

export interface StatusResponse {
  status: BookingStatus | PaymentStatus | ScheduleStatus;
  message: string;
  timestamp: string;
}

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, any>;
};

export interface ErrorResponseBody {
  error: ApiError;
  path: string;
  timestamp: string;
  requestId?: string;
}

// Zod Schemas
export const baseApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
  status: z.number().optional(),
});

export const paginationSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

// Generic API Response Type
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Entity Status
export type EntityStatus = "ACTIVE" | "INACTIVE" | "DELETED" | "PENDING";


