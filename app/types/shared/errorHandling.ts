import { ValidationError } from "./api";

//app/types/shared/errorHandling.ts

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500,
    public readonly errors?: ValidationError[],
    public readonly metadata?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, AppError);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      errors: this.errors,
      metadata: this.metadata,
    };
  }

  static badRequest(message: string, errors?: ValidationError[]) {
    return new AppError('BAD_REQUEST', message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message = 'Access forbidden') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(message = 'Resource not found', metadata?: Record<string, any>) {
    return new AppError('NOT_FOUND', message, 404, undefined, metadata);
  }

  static validation(message: string, errors: ValidationError[]) {
    return new AppError('VALIDATION_ERROR', message, 422, errors);
  }

  static conflict(message: string, metadata?: Record<string, any>) {
    return new AppError('CONFLICT', message, 409, undefined, metadata);
  }

  static internal(message = 'Internal server error', metadata?: Record<string, any>) {
    return new AppError('INTERNAL_ERROR', message, 500, undefined, metadata);
  }

  static serviceUnavailable(message = 'Service temporarily unavailable') {
    return new AppError('SERVICE_UNAVAILABLE', message, 503);
  }
}

export interface ErrorDetails {
  code: string;
  message: string;
  status: number;
  errors?: ValidationError[];
  metadata?: Record<string, any>;
  timestamp: string;
  path?: string;
  requestId?: string;
  stackTrace?: string[];
}

export interface ErrorHandlerOptions {
  includeStackTrace?: boolean;
  logErrors?: boolean;
  errorMap?: Map<string, (error: Error) => ErrorDetails>;
  defaultMessage?: string;
}

export type ErrorHandler = (error: Error | AppError, options?: ErrorHandlerOptions) => ErrorDetails;

export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

export interface ValidationRule<T = any> {
  validate: (value: T) => boolean | Promise<boolean>;
  message: string | ((value: T) => string);
}