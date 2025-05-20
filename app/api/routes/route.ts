import { NextResponse } from "next/server";
import type { ApiResponse, PaginatedApiResponse } from "@/types/shared/api";
import { Route } from "@/utils/mongodb/models/Route";
import type { RouteDocument } from "@/utils/mongodb/models/Route";
import {
  authMiddleware,
  handleApiError,
} from "@/utils/api/middleware";
import connectDB from "@/utils/mongodb/connect"
import { z } from "zod";

// Validation schemas
const routeQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["routeName", "routeCode", "distance", "baseFare", "createdAt"])
    .default("routeName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  isActive: z.boolean().default(true),
  fromStation: z.string().optional(),
  toStation: z.string().optional(),
  minDistance: z.number().min(0).optional(),
  maxDistance: z.number().min(0).optional(),
});

const routeCreateSchema = z.object({
  routeName: z.string().min(3).max(100),
  fromStation: z.string().min(24).max(24),
  toStation: z.string().min(24).max(24),
  distance: z.number().min(1),
  baseFare: z.number().min(0),
  estimatedDuration: z.string().regex(/^([0-9]+h\s)?[0-9]+m$/),
  availableClasses: z.array(z.string().min(24).max(24)).min(1),
});

interface RouteListResponse {
  routes: RouteDocument[];
  totalPages: number;
  currentPage: number;
  totalRoutes: number;
}

export async function GET(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryResult = routeQuerySchema.safeParse({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 10,
      search: searchParams.get("search"),
      sortBy: searchParams.get("sortBy") || "routeName",
      sortOrder: searchParams.get("sortOrder") || "asc",
      isActive: searchParams.get("isActive") !== "false",
      fromStation: searchParams.get("fromStation"),
      toStation: searchParams.get("toStation"),
      minDistance: searchParams.get("minDistance")
        ? Number(searchParams.get("minDistance"))
        : undefined,
      maxDistance: searchParams.get("maxDistance")
        ? Number(searchParams.get("maxDistance"))
        : undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: queryResult.error.errors.map((e) => e.message).join(", "),
        },
        { status: 400 }
      );
    }

    const queryParams = queryResult.data;
    const query: Record<string, any> = { isActive: queryParams.isActive };

    if (queryParams.search) {
      query.$or = [
        { routeName: { $regex: queryParams.search, $options: "i" } },
        { routeCode: { $regex: queryParams.search, $options: "i" } },
      ];
    }

    if (queryParams.fromStation) {
      query.fromStation = queryParams.fromStation;
    }

    if (queryParams.toStation) {
      query.toStation = queryParams.toStation;
    }

    if (queryParams.minDistance || queryParams.maxDistance) {
      query.distance = {};
      if (queryParams.minDistance) {
        query.distance.$gte = queryParams.minDistance;
      }
      if (queryParams.maxDistance) {
        query.distance.$lte = queryParams.maxDistance;
      }
    }

    const skip = (queryParams.page - 1) * queryParams.limit;
    const totalCount = await Route.countDocuments(query);
    const totalPages = Math.ceil(totalCount / queryParams.limit);

    const routes = await Route.find(query)
      .populate("fromStation", "stationName stationCode")
      .populate("toStation", "stationName stationCode")
      .populate("availableClasses", "className code baseFare")
      .sort({ [queryParams.sortBy]: queryParams.sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(queryParams.limit)
      .lean()
      .then((docs) => docs as unknown as RouteDocument[]);

    const response: PaginatedApiResponse<RouteDocument> = {
      success: true,
      data: {
        items: routes,
        pagination: {
          total: totalCount,
          page: queryParams.page,
          limit: queryParams.limit,
          pages: totalPages
        }
      },
      message: "Routes fetched successfully"
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

export async function POST(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    await connectDB();
    const body = await request.json();

    // Validate request body
    const validationResult = routeCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: validationResult.error.errors
            .map((e) => e.message)
            .join(", "),
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if route already exists
    const existingRoute = await Route.findOne({
      fromStation: validatedData.fromStation,
      toStation: validatedData.toStation,
    });

    if (existingRoute) {
      return NextResponse.json(
        {
          success: false,
          error: "Conflict",
          status: 409,
          message: "Route between these stations already exists",
        },
        { status: 409 }
      );
    }

    const route = await Route.create({
      ...validatedData,
      isActive: true,
    });

    await route.populate([
      { path: "fromStation", select: "stationName stationCode" },
      { path: "toStation", select: "stationName stationCode" },
      { path: "availableClasses", select: "className code baseFare" },
    ]);

    const response: ApiResponse<RouteDocument> = {
      success: true,
      data: route,
      message: "Route created successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
