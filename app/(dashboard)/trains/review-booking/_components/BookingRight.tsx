"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { BookingDetails } from "../../payment/_types/paystack.types";

interface Station {
  _id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

interface TrainClass {
  _id: string;
  name: string;
  code: string;
  baseFare: number;
  availableSeats: number;
}

interface Train {
  _id: string;
  trainNumber: string;
  trainName: string;
}

interface ScheduleDetails {
  _id: string;
  train: Train;
  departureStation: Station;
  arrivalStation: Station;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableClasses: TrainClass[];
  status: string;
  platform: string;
  date: string;
}

interface BookingRightProps {
  schedule: any; // We'll properly type this later
  travelers?: any[];
}

export function BookingRight({ schedule, travelers = [] }: BookingRightProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useSearchParams();
  const selectedClass = params.get('class') || '';
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  // Guard clause for missing data
  if (!schedule || !session?.user) {
    return null;
  }

  // Find the selected class details
  const selectedClassDetails = schedule.availableClasses?.find(
    (cls: any) => cls.code === selectedClass
  );

  if (!selectedClassDetails) {
    return <div>Invalid class selected</div>;
  }

  const baseFare = selectedClassDetails.baseFare;
  const taxAndGST = Math.round(baseFare * 0.18);
  const totalPrice = baseFare + taxAndGST - promoDiscount;

  const handlePromoCode = () => {
    if (promoCode === 'FIRST') {
      setPromoDiscount(Math.round(baseFare * 0.1));
      setPromoApplied(true);
    }
  };

  const handleBookNow = () => {
    const bookingDetails: BookingDetails = {
      scheduleId: schedule._id,
      trainId: schedule._id, // Fallback to schedule ID if train ID is not available
      trainNumber: schedule.trainNumber || 'N/A',
      trainName: schedule.trainName || 'N/A',
      departureStation: schedule.departureStation,
      arrivalStation: schedule.arrivalStation,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      class: selectedClass,
      baseFare,
      taxAndGST,
      promoDiscount,
      totalPrice,
      date: schedule.date,
    };

    // Generate a random booking reference
    const bookingRef = `TR-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    
    localStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
    router.push(`/trains/payment?ref=${bookingRef}`);
  };

  return (
    <div className="w-full space-y-4">
      {/* Boarding Details */}
      <div className="bg-[#F5F5F5] p-4 rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              {schedule.trainNumber} - {schedule.trainName}
            </p>
            <p className="text-[#07561A]">Class {selectedClass} • Tatkal Quota</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-sm">{schedule.departureTime}</p>
            <p className="text-sm text-gray-600">
              {schedule.departureStation?.name} ({schedule.departureStation?.code})
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">{schedule.duration || '8 hours'}</p>
            <div className="w-24 h-0.5 bg-gray-300 my-1"></div>
          </div>
          <div className="text-right">
            <p className="text-sm">{schedule.arrivalTime}</p>
            <p className="text-sm text-gray-600">
              {schedule.arrivalStation?.name} ({schedule.arrivalStation?.code})
            </p>
          </div>
        </div>
      </div>

      {/* Offers */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Offers</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex items-start gap-2">
              <Image
                src="/Assets/Vector.png"
                width={16}
                height={16}
                alt="check"
                className="mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">50% off up to ₦100</p>
                <p className="text-xs text-gray-600">Use code BOOKNOW</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setPromoCode("BOOKNOW");
                handlePromoCode();
              }}
              className="text-[#07561A] text-sm font-medium hover:text-[#064e15] px-4 py-1 border border-[#07561A] rounded-md"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Apply Code */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Apply Code</h3>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter Code"
              className="flex-1 px-3 py-2 border-t-0 border-b-2 border-x-0 border-gray-300 focus:outline-none focus:border-[#07561A] bg-transparent"
              disabled={promoApplied}
            />
            <button
              onClick={handlePromoCode}
              className="bg-[#07561A] text-white px-6 py-2 rounded-md whitespace-nowrap hover:bg-[#064e15] transition-colors"
              disabled={promoApplied}
            >
              Apply
            </button>
          </div>
          {promoApplied && (
            <p className="text-green-500 mt-2">Promo code applied successfully!</p>
          )}
        </div>
      </div>

      {/* Bill Details */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Bill Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Ticket Fare:</span>
            <span>₦{baseFare.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & GST (18%):</span>
            <span>₦{taxAndGST.toLocaleString()}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-[#07561A]">
              <span>Discount:</span>
              <span>-₦{promoDiscount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total Charge:</span>
            <span>₦{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={handleBookNow}
        className="w-full bg-[#07561A] text-white py-3 rounded-lg font-medium hover:bg-[#064e15] transition-colors"
      >
        Book Now
      </button>
    </div>
  );
}

export default BookingRight;

