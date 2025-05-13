import { NextResponse } from "next/server";
import { connectDB } from "@/utils/mongodb/connect";
import { Profile } from "@/utils/mongodb/models/Profile";
import { v4 as uuidv4 } from "uuid";
import {
  authMiddleware,
  validateRequiredParams,
  handleApiError,
} from "@/utils/api/middleware";

function generateNaijaRailsId(): string {
  const prefix = "NR";
  const timestamp = Date.now().toString().slice(-6);
  const random = uuidv4().slice(0, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function GET(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    // Validate at least one identifier is provided
    if (!userId && !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Parameters",
          status: 400,
          message: "Either userId or email is required",
        },
        { status: 400 }
      );
    }

    await connectDB();
    const query = userId ? { userId } : { email };
    const profile = await Profile.findOne(query);

    if (!profile && userId) {
      // Create default profile if none exists
      const naijaRailsId = generateNaijaRailsId();
      const defaultProfile = await Profile.create({
        userId,
        naijaRailsId,
        fullName: "New User",
        email: userId,
        phoneNumber: "",
        defaultNationality: "Nigerian",
        preferredBerth: "lower",
      });

      return NextResponse.json({
        success: true,
        data: defaultProfile,
        message: "Default profile created",
      });
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          status: 404,
          message: "Profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Profile retrieved successfully",
    });
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

    const validationError = validateRequiredParams(body, [
      "userId",
      "fullName",
      "email",
      "phoneNumber",
      "defaultNationality",
    ]);

    if (validationError) {
      return NextResponse.json(validationError, {
        status: validationError.status,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          status: 400,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: body.userId });
    if (existingProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Conflict",
          status: 409,
          message: "Profile already exists",
        },
        { status: 409 }
      );
    }

    const naijaRailsId = generateNaijaRailsId();
    const profile = await Profile.create({
      ...body,
      naijaRailsId,
    });

    return NextResponse.json({
      success: true,
      data: profile,
      message: "Profile created successfully",
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}

export async function PUT(request: Request) {
  try {
    const authError = await authMiddleware(request);
    if (authError) {
      return NextResponse.json(authError, { status: authError.status });
    }

    await connectDB();
    const body = await request.json();

    const validationError = validateRequiredParams(body, ["userId"]);
    if (validationError) {
      return NextResponse.json(validationError, {
        status: validationError.status,
      });
    }

    const { userId, ...updateData } = body;

    // If email is being updated, validate format
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation Error",
            status: 400,
            message: "Invalid email format",
          },
          { status: 400 }
        );
      }
    }

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "Not Found",
          status: 404,
          message: "Profile not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    const errorResponse = handleApiError(error);
    return NextResponse.json(errorResponse, { status: errorResponse.status });
  }
}
