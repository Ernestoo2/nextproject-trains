import { Types } from "mongoose";
import { BaseApiResponse } from "./api";
import { DateRange } from "./searchApi";

//app/types/shared/analyticsApi.ts

export type MetricPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface MetricPoint {
  timestamp: string;
  value: number;
  metadata?: Record<string, any>;
}

export interface BookingMetrics {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  revenue: number;
  averageTicketPrice: number;
  popularRoutes: Array<{
    routeId: Types.ObjectId;
    bookings: number;
    revenue: number;
  }>;
  popularClasses: Array<{
    class: string;
    bookings: number;
    revenue: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    bookings: number;
  }>;
}

export interface TrainMetrics {
  totalTrains: number;
  activeTrains: number;
  totalRoutes: number;
  averageOccupancy: number;
  delayStats: {
    onTime: number;
    delayed: number;
    cancelled: number;
    averageDelay: number;
  };
  routePerformance: Array<{
    routeId: Types.ObjectId;
    onTimePerformance: number;
    averageDelay: number;
    occupancy: number;
  }>;
}

export interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  verifiedUsers: number;
  userSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
  }>;
  retentionRate: number;
  churnRate: number;
}

export interface AnalyticsRequest {
  metrics: string[];
  period: MetricPeriod;
  dateRange: DateRange;
  filters?: {
    routes?: Types.ObjectId[];
    classes?: string[];
    trainIds?: Types.ObjectId[];
    userSegments?: string[];
  };
}

export interface AnalyticsResponse extends BaseApiResponse {
  data: {
    period: MetricPeriod;
    dateRange: DateRange;
    metrics: {
      bookings?: BookingMetrics;
      trains?: TrainMetrics;
      users?: UserMetrics;
    };
    timeSeries: {
      [key: string]: MetricPoint[];
    };
  };
}

export interface ReportGenerationRequest {
  type: 'BOOKINGS' | 'TRAINS' | 'USERS' | 'REVENUE';
  format: 'PDF' | 'CSV' | 'EXCEL';
  dateRange: DateRange;
  filters?: Record<string, any>;
  includeCharts?: boolean;
}

export interface ReportResponse extends BaseApiResponse {
  data: {
    reportId: string;
    downloadUrl: string;
    expiresAt: Date;
  };
}