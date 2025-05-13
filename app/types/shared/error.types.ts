import { ValidationError } from "./api";


class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500,
    public readonly errors?: ValidationError[]
  ) {
    super(message);
    this.name = 'AppError';
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

  static notFound(message = 'Resource not found') {
    return new AppError('NOT_FOUND', message, 404);
  }

  static validation(message: string, errors: ValidationError[]) {
    return new AppError('VALIDATION_ERROR', message, 422, errors);
  }

  static conflict(message: string) {
    return new AppError('CONFLICT', message, 409);
  }

  static internal(message = 'Internal server error') {
    return new AppError('INTERNAL_ERROR', message, 500);
  }
}

interface ErrorResponse {
  code: string;
  message: string;
  status: number;
  errors?: ValidationError[];
  timestamp: string;
  path?: string;
  requestId?: string;
}

type ErrorHandler = (error: Error) => ErrorResponse;

interface ErrorMapperConfig {
  defaultMessage?: string;
  defaultStatus?: number;
  logErrors?: boolean;
  includeStack?: boolean;
}
