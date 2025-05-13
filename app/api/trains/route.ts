import { connectDB } from "@/utils/mongodb/connect";
import { Train } from "@/utils/mongodb/models/Train";
import { z } from "zod";
import {
  authMiddleware,
  validateRequest,
  handleApiError,
  createApiResponse,
  createErrorResponse,
} from "@/utils/api/middleware";
import type { PaginatedApiResponse } from "@/types/shared/api";

// Validation Schemas
const trainQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  sortBy: z.enum(["trainName", "trainNumber", "createdAt"]).default("trainNumber"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  isActive: z.boolean().default(true),
  date: z.string().optional(),
});

const trainCreateSchema = z.object({
  trainName: z.string().min(3).max(100),
  trainNumber: z.string().regex(/^[A-Z]{2}\d{3}$/),
  classes: z.array(z.string().min(24).max(24)).min(1),
  isActive: z.boolean().default(true),
});

type TrainQueryParams = z.infer<typeof trainQuerySchema>;

export async function GET(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) return createErrorResponse(authError);

    await connectDB();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryResult = validateRequest(trainQuerySchema, {
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy") || "trainNumber",
      sortOrder: searchParams.get("sortOrder") || "asc",
      isActive: searchParams.get("isActive") !== "false",
      date: searchParams.get("date"),
    });

    if (!queryResult.success) {
      return createErrorResponse({
        success: false,
        error: "Validation Error",
        status: 400,
        message: queryResult.error,
      });
    }

    const queryParams = queryResult.data as TrainQueryParams;
    const query: Record<string, any> = { isActive: queryParams.isActive };

    if (queryParams.search) {
      query.$or = [
        { trainName: { $regex: queryParams.search, $options: "i" } },
        { trainNumber: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (queryParams.page - 1) * queryParams.limit;
    const totalCount = await Train.countDocuments(query);
    const totalPages = Math.ceil(totalCount / queryParams.limit);

    // Create sort options
    const sortOptions: Record<string, 1 | -1> = {
      [queryParams.sortBy as string]: queryParams.sortOrder === "asc" ? 1 : -1,
    };

    // Fetch trains with pagination
    const trains = await Train.find(query)
      .populate("classes")
      .populate({
        path: "routes",
        populate: {
          path: "route",
          populate: ["fromStation", "toStation"],
        },
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(queryParams.limit);

    // Create paginated response
    const response: PaginatedApiResponse<typeof trains> = {
      success: true,
      data: trains,
      message: "Trains fetched successfully",
      pagination: {
        currentPage: queryParams.page,
        totalPages,
        totalItems: totalCount,
        limit: queryParams.limit,
        hasMore: queryParams.page < totalPages,
      },
    };

    return createApiResponse(response);
  } catch (error) {
    return createErrorResponse(handleApiError(error));
  }
}

export async function POST(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) return createErrorResponse(authError);

    await connectDB();
    const body = await request.json();

    // Validate request body
    const validationResult = validateRequest(trainCreateSchema, body);
    if (!validationResult.success) {
      return createErrorResponse({
        success: false,
        error: "Validation Error",
        status: 400,
        message: validationResult.error,
      });
    }

    const validatedData = validationResult.data;

    // Check for duplicate train number
    const existingTrain = await Train.findOne({
      trainNumber: validatedData.trainNumber,
    });

    if (existingTrain) {
      return createErrorResponse({
        success: false,
        error: "Conflict",
        status: 409,
        message: "Train number already exists",
      });
    }

    const train = await Train.create(validatedData);
    await train.populate("classes");
    await train.populate({
      path: "routes",
      populate: {
        path: "route",
        populate: ["fromStation", "toStation"],
      },
    });

    return createApiResponse(train, "Train created successfully");
  } catch (error) {
    return createErrorResponse(handleApiError(error));
  }
}
