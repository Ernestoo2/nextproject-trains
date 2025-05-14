"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookingStore } from "@/store/bookingStore";
import type { ScheduleWithDetails } from "@/types/shared/database";
import type { Passenger } from "@/types/shared/booking";
import { toast } from "sonner";
import { Loader2, TicketPercent } from "lucide-react";

interface BookingRightProps {
  schedule: ScheduleWithDetails;
  travelers: Passenger[];
}

export function BookingRight({ schedule, travelers }: BookingRightProps) {
  const router = useRouter();
  const { bookingState, actions } = useBookingStore();

  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!bookingState || !schedule) {
    return (
      <div className="w-full md:w-2/5 lg:w-1/3 xl:w-1/4 p-4 space-y-6 sticky top-24">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePromoCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode) {
      toast.error("Please enter a promo code");
      return;
    }
    setIsLoading(true);
    try {
      await actions.applyPromoCode(promoCode);
      toast.success("Promo code applied successfully");
      setPromoCode("");
    } catch (error: any) {
      toast.error(error.message || "Failed to apply promo code");
      } finally {
        setIsLoading(false);
      }
    };

  const handleRemovePromoCode = async () => {
    setIsLoading(true);
    try {
      await actions.removePromoCode();
      toast.success("Promo code removed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove promo code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = async () => {
    if (!travelers || travelers.length === 0) {
      toast.error("Please add at least one traveler.");
      return;
    }
    setIsLoading(true);
    try {
      const bookingDataForPayment = {
        scheduleId: schedule._id,
        trainName: schedule.trainName,
        trainNumber: schedule.trainNumber,
        departureStationName: schedule.departureStation?.stationName,
        arrivalStationName: schedule.arrivalStation?.stationName,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        journeyDate: schedule.date,
        selectedClass: bookingState.selectedClass,
        passengers: travelers,
        fareDetails: {
          baseFare: bookingState.baseFare,
          taxes: bookingState.taxes,
          discount: bookingState.discount,
          totalAmount: bookingState.totalAmount,
          promoCode: bookingState.appliedPromoCode,
        },
      };
      
      localStorage.setItem("bookingPaymentDetails", JSON.stringify(bookingDataForPayment));

      if (bookingState.bookingDetails?._id) {
        router.push(`/payment?bookingId=${bookingState.bookingDetails._id}`);
      } else {
        toast.info("Proceeding to payment. Booking will be finalized if not already.");
        router.push("/payment");
      }

    } catch (error) {
      console.error("Error proceeding to payment:", error);
      toast.error("Failed to proceed to payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const currency = "₦";

  return (
    <div className="w-full md:w-2/5 lg:w-1/3 xl:w-1/4 space-y-6 sticky top-24">
      {/* Train & Journey Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex items-center mb-4">
          <div className="w-20 h-[60px] bg-gray-200 rounded-md mr-4 flex items-center justify-center text-gray-400">
            <TicketPercent size={32} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{schedule.trainName || "Train Journey"}</h2>
            <p className="text-sm text-gray-600">{schedule.trainNumber}</p>
        </div>
      </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">From:</span>
            <span className="font-medium text-gray-800">{schedule.departureStation?.stationName || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">To:</span>
            <span className="font-medium text-gray-800">{schedule.arrivalStation?.stationName || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium text-gray-800">{new Date(schedule.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Departure:</span>
            <span className="font-medium text-gray-800">{schedule.departureTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Arrival:</span>
            <span className="font-medium text-gray-800">{schedule.arrivalTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Class:</span>
            <span className="font-medium text-gray-800 capitalize">{bookingState.selectedClass?.toLowerCase() || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Travelers:</span>
            <span className="font-medium text-gray-800">{travelers.length}</span>
          </div>
        </div>
      </div>
      
      {/* Fare Details */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-md font-semibold mb-4 text-gray-800">Fare Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Fare ({travelers.length}x)</span>
            <span>{currency}{(bookingState.baseFare || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Taxes & Charges</span>
            <span>{currency}{(bookingState.taxes || 0).toLocaleString()}</span>
            </div>
          {bookingState.discount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>Discount {bookingState.appliedPromoCode ? `(${bookingState.appliedPromoCode})` : ""}</span>
              <span>-{currency}{(bookingState.discount || 0).toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3 mt-3">
            <div className="flex justify-between items-center font-semibold text-lg text-gray-800">
              <span>Total Payable</span>
              <span>{currency}{(bookingState.totalAmount || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Code */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h3 className="text-md font-semibold mb-3 text-gray-800">Have a Promo Code?</h3>
        {!bookingState.appliedPromoCode ? (
          <form onSubmit={handlePromoCodeSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <Input
                id="promoCodeInput"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter Code (e.g. NRC20)"
                disabled={isLoading}
                className="focus:border-[#07561A] text-sm"
              />
              <Button
                type="submit"
                disabled={isLoading || !promoCode}
                className="bg-[#07561A] hover:bg-[#064516] text-white px-4 text-sm whitespace-nowrap"
              >
                {isLoading && !bookingState.appliedPromoCode ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm text-green-700">
              Applied: <span className="font-semibold">{bookingState.appliedPromoCode}</span> (-{currency}{bookingState.discount.toLocaleString()})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePromoCode}
              disabled={isLoading}
              className="text-red-500 hover:text-red-700 text-xs p-1 h-auto"
            >
              {isLoading && bookingState.appliedPromoCode ? <Loader2 className="h-3 w-3 animate-spin" /> : "Remove"}
            </Button>
          </div>
        )}
      </div>

      {/* Proceed to Payment */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <Button
        onClick={handleBookNow}
          disabled={isLoading || travelers.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3 transition-colors duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Book Now & Pay ${currency}${(bookingState.totalAmount || 0).toLocaleString()}`
          )}
        </Button>
        <p className="text-xs text-gray-500 mt-3 text-center">
          By clicking "Book Now & Pay", you agree to our <a href="/terms" className="underline hover:text-green-600">Terms of Service</a> and <a href="/privacy" className="underline hover:text-green-600">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

export default BookingRight;
