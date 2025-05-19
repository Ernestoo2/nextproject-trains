"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookingStore } from "@/store/bookingStore";
import type { ScheduleWithDetails } from "@/types/shared/database";
import type { Passenger } from "@/types/shared/booking";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface BookingRightProps {
  schedule: ScheduleWithDetails;
  travelers: Passenger[];
}

export function BookingRight({ schedule, travelers }: BookingRightProps) {
  const router = useRouter();
  const { bookingState, actions } = useBookingStore();
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const promoApplied = !!bookingState.appliedPromoCode;

  const { 
    baseFare, 
    taxes, 
    discount: promoDiscount, 
    totalAmount: totalPrice, 
    currentDefaultClassId,
    appliedPromoCode
  } = bookingState;

  const handleApplyPromoCode = () => {
    if (!promoCodeInput) {
      toast.error("Please enter a promo code");
      return;
    }
    actions.applyPromoCode(promoCodeInput)
      .then(() => {
        toast.success("Promo code applied successfully!");
      })
      .catch((err) => {
        toast.error(err.message || "Invalid promo code");
      });
  };
  
  const handleRemovePromoCode = () => {
    actions.removePromoCode().then(() => {
        toast.info("Promo code removed.");
        setPromoCodeInput("");
    });
  };


  const handleBookNow = async () => {
    if (!travelers || travelers.length === 0) {
      toast.error("Please add at least one traveler.");
      return;
    }
    setIsProcessingPayment(true);
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
        selectedClass: currentDefaultClassId,
        passengers: travelers,
        fareDetails: {
          baseFare: baseFare,
          taxes: taxes,
          discount: promoDiscount,
          totalAmount: totalPrice,
          promoCode: appliedPromoCode,
        },
      };
      
      localStorage.setItem("bookingPaymentDetails", JSON.stringify(bookingDataForPayment));
      router.push("/trains/payment");
    } catch (error) {
      console.error("Error proceeding to payment:", error);
      toast.error("Failed to proceed to payment. Please try again.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (!schedule) {
    return <div>Loading schedule details...</div>;
  }
  
  const selectedClassName = schedule.availableClasses.find(c => c.classCode === currentDefaultClassId || c._id === currentDefaultClassId)?.className || currentDefaultClassId;

  return (
    <div className="w-full space-y-4">
      <div className="bg-[#07561A1A] p-4 rounded-lg border-[#07561A] shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Boarding Details</h3>
        <div className="flex justify-between items-center">
          <p className="text-gray-600 text-lg font-semibold">{schedule.trainName}</p>
          <p className="text-[#07561A]">
            <span className="font-medium">Class {selectedClassName}</span> &bull; Standard Quota
          </p>
        </div>
        <div className="flex justify-between mt-4">
          <div className="w-full">
            <p className="text-sm font-normal">{new Date(schedule.date).toLocaleDateString()}</p>
            <p className="text-sm font-medium">{schedule.departureTime}</p>
            <p className="text-sm text-[#6B7280]">{schedule.departureStation?.stationName}</p>
          </div>
          <div className="flex flex-col w-full items-center">
            <span className="text-sm text-[#6B7280]">{schedule.duration}</span>
            <hr className="border-t border-[#D1D5DB] w-full mt-1" />
          </div>
          <div className="text-right w-4/5">
            <p className="text-sm font-normal">{new Date(schedule.date).toLocaleDateString()}</p>
            <p className="text-sm font-medium">{schedule.arrivalTime}</p>
            <p className="text-sm text-[#6B7280]">{schedule.arrivalStation?.stationName}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border-[2px] border-dotted border-[#07561A] shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Offers</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm flex gap-2">
              <Image src="/Assets/Vector.png" width={16} height={16} alt="check" className="object-scale-down" />
              50% off up to ₦100 | Use code <span className="font-medium">BOOKNOW</span>
            </p>
            <button onClick={() => { setPromoCodeInput("BOOKNOW"); actions.applyPromoCode("BOOKNOW");}} className="text-[#07561A] hover:underline" disabled={promoApplied && appliedPromoCode === 'BOOKNOW'}>
              {appliedPromoCode === 'BOOKNOW' ? 'Applied' : 'Apply'}
            </button>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-gray-600 flex gap-2">
              <Image src="/Assets/Vector.png" width={16} height={16} alt="check" className="object-scale-down" />
              20% off | Use code <span className="font-medium">FIRSTTIME</span>
            </p>
            <button onClick={() => { setPromoCodeInput("FIRSTTIME"); actions.applyPromoCode("FIRSTTIME");}} className="text-[#07561A] hover:underline" disabled={promoApplied && appliedPromoCode === 'FIRSTTIME'}>
               {appliedPromoCode === 'FIRSTTIME' ? 'Applied' : 'Apply'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold flex gap-2 text-gray-800 mb-2">
          <Image src="/Assets/Vector.png" width={16} height={16} alt="check" className="object-scale-down" />
          Apply Code
        </h3>
        <div className="flex w-full items-center gap-4">
          <Input
            type="text"
            placeholder="Enter Code"
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value)}
            className="w-full border-t-0 border-x-0 border-b-2 border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={promoApplied}
          />
          {!promoApplied ? (
          <Button
              onClick={handleApplyPromoCode}
            className="bg-[#07561A] text-white px-6 py-2 rounded-md hover:bg-green-600"
              disabled={isProcessingPayment}
          >
              {isProcessingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          ) : (
            <Button
              onClick={handleRemovePromoCode}
              variant="outline"
              className="px-6 py-2 rounded-md border-red-500 text-red-500 hover:bg-red-50"
            >
              Remove
          </Button>
          )}
        </div>
        {promoApplied && (
          <p className="text-green-500 mt-2">Promo code <span className="font-medium">{appliedPromoCode}</span> applied! Discount: ₦{promoDiscount.toLocaleString()}</p>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Ticket Fare ({travelers.length}x):</span>
            <span>₦{baseFare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & GST (8%):</span>
            <span>₦{taxes.toLocaleString()}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-[#07561A]">
              <span>Discount ({appliedPromoCode}):</span>
              <span>-₦{promoDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total Charge:</span>
            <span>₦{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <Button 
        onClick={handleBookNow}
        className="w-full bg-[#07561A] text-white py-3 rounded-lg font-medium hover:bg-[#064e15] transition-colors"
        disabled={isProcessingPayment || travelers.length === 0}
      >
        {isProcessingPayment ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          `Book Now & Pay ₦${totalPrice.toLocaleString()}`
        )}
      </Button>
    </div>
  );
}

export default BookingRight;
