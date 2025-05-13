import { NextRequest } from "next/server";

//app/types/shared/logging.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  requestId?: string;
  userId?: string;
  tags?: string[];
}

export interface RequestLogContext {
  req: NextRequest;
  startTime: number;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  responseTime: number;
  processingTime: number;
  databaseQueries: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: number;
}

export interface ErrorMetrics {
  code: string;
  status: number;
  count: number;
  lastOccurred: Date;
  affectedUsers: number;
}

export interface MonitoringConfig {
  sampleRate: number;
  enabledMetrics: string[];
  alertThresholds: {
    responseTime?: number;
    errorRate?: number;
    cpuUsage?: number;
    memoryUsage?: number;
  };
}

export interface MetricsCollector {
  increment(metric: string, value?: number, tags?: string[]): void;
  gauge(metric: string, value: number, tags?: string[]): void;
  histogram(metric: string, value: number, tags?: string[]): void;
  recordTiming(metric: string, timeMs: number, tags?: string[]): void;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
  timeout?: number;
  interval?: number;
  dependencies?: string[];
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, {
    status: boolean;
    latency?: number;
    message?: string;
    lastChecked: Date;
  }>;
  timestamp: Date;
}

export interface TracingSpan {
  name: string;
  startTime: number;
  endTime?: number;
  type: 'http' | 'db' | 'cache' | 'external';
  metadata?: Record<string, any>;
  parentId?: string;
  children?: TracingSpan[];
}

export interface RequestTrace {
  traceId: string;
  parentId?: string;
  spans: TracingSpan[];
  status: number;
  duration: number;
}