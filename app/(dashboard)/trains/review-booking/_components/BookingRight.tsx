"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useBookingState } from "@/_hooks/useBookingState";
import { Button } from "@/components/ui/button";
import { Schedule } from "@/types/shared/database";
import { BookingDetails, BookingStatus } from "@/types/shared/booking";
import { PaymentStatus } from "@/types/shared/payments";
import { formatCurrency } from "@/lib/utils";
import type { Booking } from "@/types/shared/database";

interface BookingRightProps {
  bookingId: string;
  schedule: Schedule;
}

interface BookingSummary {
  totalPassengers: number;
  totalFare: number;
  taxes: number;
  discount: number;
  finalAmount: number;
}

export function BookingRight({ bookingId, schedule }: BookingRightProps) {
  const router = useRouter();
  const { state, isLoading } = useBookingState(bookingId);

  if (!state || isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#07561A]" />
      </div>
    );
  }

  const calculateBookingSummary = (): BookingSummary => {
    const totalPassengers = state.passengers.length;
    const baseFare = schedule.fare?.[state.selectedClass as keyof typeof schedule.fare] || 0;
    const totalFare = baseFare * totalPassengers;
    const taxes = totalFare * 0.05; // 5% tax
    const discount = state.promoDiscount || 0;
    const finalAmount = totalFare + taxes - discount;

    return {
      totalPassengers,
      totalFare,
      taxes,
      discount,
      finalAmount
    };
  };

  const handleProceedToPayment = async () => {
    try {
      const response = await fetch("/api/booking/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          scheduleId: schedule._id,
          passengers: state.passengers,
          selectedClass: state.selectedClass,
          ...calculateBookingSummary()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as { data: BookingDetails };

      if (data.data.status === "INITIATED" && data.data.paymentStatus === "PENDING") {
        router.push(`/trains/payment?bookingId=${bookingId}`);
      } else {
        throw new Error("Failed to initiate booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      // Handle error appropriately
    }
  };

  const summary = calculateBookingSummary();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Passengers</span>
          <span className="font-medium">{summary.totalPassengers}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Base Fare</span>
          <span className="font-medium">{formatCurrency(summary.totalFare)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Taxes & Fees (5%)</span>
          <span className="font-medium">{formatCurrency(summary.taxes)}</span>
        </div>
        
        {summary.discount > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatCurrency(summary.discount)}</span>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount</span>
            <span className="text-lg font-bold text-[#07561A]">
              {formatCurrency(summary.finalAmount)}
            </span>
          </div>
        </div>
        
        <Button
          onClick={handleProceedToPayment}
          disabled={state.passengers.length === 0 || isLoading}
          className="w-full mt-6 bg-[#07561A] hover:bg-[#064516] text-white"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
          ) : (
            "Proceed to Payment"
          )}
        </Button>
      </div>
    </div>
  );
}
