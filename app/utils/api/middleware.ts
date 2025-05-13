import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth/next-auth";
import { ApiErrorResponse } from "@/types/shared/api";
import { z } from "zod";

// Auth Middleware
export async function authMiddleware(request: Request): Promise<ApiErrorResponse | null> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      success: false,
      error: "Unauthorized",
      status: 401,
      message: "You must be logged in to access this resource",
    };
  }

  return null;
}

// Validation Middleware
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      error: result.error.errors.map((e) => e.message).join(", "),
    };
  }

  return { success: true, data: result.data };
}

// Error Handler
export function handleApiError(error: unknown): ApiErrorResponse {
  console.error("API Error:", error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: "Validation Error",
      status: 400,
      message: error.errors.map((e) => e.message).join(", "),
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: "Internal Server Error",
      status: 500,
      message: error.message,
    };
  }

  return {
    success: false,
    error: "Internal Server Error",
    status: 500,
    message: "An unexpected error occurred",
  };
}

// Response Handler
export function createApiResponse<T>(
  data: T,
  message: string = "Success"
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

// Error Response Handler
export function createErrorResponse(
  error: ApiErrorResponse
): NextResponse {
  return NextResponse.json(error, { status: error.status });
}

// Required Parameters Validator
export function validateRequiredParams(
  params: Record<string, string | null | undefined>,
  requiredParams: string[]
): ApiErrorResponse | null {
  const missingParams = requiredParams.filter(
    (param) => !params[param] || params[param]?.trim() === ""
  );

  if (missingParams.length > 0) {
    return {
      success: false,
      error: "Missing Required Parameters",
      status: 400,
      message: `Missing required parameters: ${missingParams.join(", ")}`,
    };
  }

  return null;
}
