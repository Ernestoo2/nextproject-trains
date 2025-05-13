import { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ErrorHandlerOptions } from "./errorHandling";
import { ValidationSchema } from "./validation";

//app/types/shared/middleware.ts

export interface MiddlewareContext {
  req: NextRequest;
  session: Session | null;
  params?: Record<string, string>;
  meta?: Record<string, any>;
}

export type MiddlewareHandler = (
  context: MiddlewareContext,
  next: () => Promise<NextResponse>
) => Promise<NextResponse>;

export interface ValidationMiddlewareOptions {
  schema: ValidationSchema;
  validateQuery?: boolean;
  validateBody?: boolean;
  abortEarly?: boolean;
}

export interface AuthMiddlewareOptions {
  roles?: string[];
  allowUnverified?: boolean;
  requireComplete2FA?: boolean;
}

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

export interface CacheMiddlewareOptions {
  ttl: number;
  key?: string | ((req: NextRequest) => string);
  condition?: (req: NextRequest) => boolean;
  serialize?: (data: any) => string;
  deserialize?: (data: string) => any;
}

export interface LoggerOptions {
  level?: 'debug' | 'info' | 'warn' | 'error';
  format?: 'json' | 'text';
  exclude?: string[];
  maskFields?: string[];
}

export interface ErrorMiddlewareOptions extends ErrorHandlerOptions {
  handleUncaughtErrors?: boolean;
  errorResponseFormat?: 'json' | 'html';
  defaultErrorStatus?: number;
}

export type MiddlewareFactory = (options?: any) => MiddlewareHandler;

// Middleware composition utilities
export type MiddlewareStack = MiddlewareHandler[];

export interface MiddlewareComposer {
  use: (middleware: MiddlewareHandler) => MiddlewareComposer;
  compose: () => MiddlewareHandler;
}

// Response enhancement middleware types
export interface ResponseEnhancerOptions {
  headers?: Record<string, string>;
  cookies?: Record<string, { value: string; options?: any }>;
  transforms?: Array<(data: any) => any>;
}