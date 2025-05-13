import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getPaymentById } from "@/api/api";
import { ApiErrorResponse, ApiResponse, ApiSuccessResponse } from "@/types/shared/api";
import { IPayment } from "@/types/shared/database";
import { authOptions } from "@/utils/auth/next-auth";

//app/api/payments/[paymentId]/route.ts

export async function GET(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      const response: ApiErrorResponse = {
        success: false,
        error: "Unauthorized",
        status: 401,
        message: "You must be logged in to view payment details"
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse<IPayment> = await getPaymentById(params.paymentId);

    if (!response.success || !response.data) {
      return NextResponse.json({
        success: false,
        error: response.error || "Payment not found",
        status: response.error ? 400 : 404,
        message: response.message || `No payment found with ID ${params.paymentId}`
      }, { status: response.error ? 400 : 404 });
    }

    // Verify user has access to this payment
    if (response.data.userId.toString() !== session.user.id) {
      return NextResponse.json({
        success: false,
        error: "Forbidden",
        status: 403,
        message: "You do not have permission to view this payment"
      }, { status: 403 });
    }

    const successResponse: ApiSuccessResponse<IPayment> = {
      success: true,
      data: response.data,
      message: "Payment details fetched successfully"
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return NextResponse.json({
      success: false,
      error: "Internal Server Error",
      status: 500,
      message: "An unexpected error occurred while fetching payment details"
    }, { status: 500 });
  }
}

// For payment verification/update endpoints
export async function PUT(
  request: Request,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        success: false,
        error: "Unauthorized",
        status: 401,
        message: "You must be logged in to update payment status"
      }, { status: 401 });
    }

    const updateData = await request.json();
    const response: ApiResponse<IPayment> = await updatePaymentStatus(params.paymentId, updateData);

    if (!response.success) {
      return NextResponse.json({
        success: false,
        error: response.error || "Failed to update payment status",
        status: 400,
        message: response.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: response.data,
      message: "Payment status updated successfully"
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return NextResponse.json({
      success: false,
      error: "Internal Server Error",
      status: 500,
      message: "An unexpected error occurred while updating payment status"
    }, { status: 500 });
  }
}