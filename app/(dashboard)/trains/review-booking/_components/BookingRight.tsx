"use client";

import React, { useState } from "react";
import { TrainDetails } from "@/app/api/types/types";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookingDetails } from "../../payment/_types/paystack.types";

interface BookingRightProps {
  train: TrainDetails;
  travelers: {
    name: string;
    age: string;
    gender: string;
    nationality: string;
    berthPreference: string;
  }[];
}

const BookingRight: React.FC<BookingRightProps> = ({ train, travelers }) => {
  const { data: session } = useSession();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const router = useRouter();

  if (!session?.user) {
    return null;
  }

  const basePrice = 30000;
  const taxAndGST = 5000;
  const totalPrice = basePrice + taxAndGST - appliedDiscount;

  const handleApplyCode = () => {
    if (promoCode.toUpperCase() === "BOOKNOW") {
      setAppliedDiscount(basePrice * 0.5); // 50% off
    } else if (promoCode.toUpperCase() === "FIRSTTIME") {
      setAppliedDiscount(basePrice * 0.2); // 20% off
    } else {
      alert("Invalid promo code");
      setAppliedDiscount(0);
    }
  };

  const getRouteInfo = () => {
    if (!train.routes || train.routes.length === 0) {
      return {
        source: train.departureStation || "N/A",
        destination: train.arrivalStation || "N/A",
        departureTime: train.departureTime || "N/A",
        arrivalTime: train.arrivalTime || "N/A",
        duration: train.duration || "N/A",
      };
    }

    const firstRoute = train.routes[0];
    const lastRoute = train.routes[train.routes.length - 1];

    return {
      source: firstRoute.station.name,
      destination: lastRoute.station.name,
      departureTime: firstRoute.departureTime,
      arrivalTime: lastRoute.arrivalTime,
      duration: "8 hours", // Calculate this based on times if needed
    };
  };

  const routeInfo = getRouteInfo();

  const handleBookNow = () => {
    const bookingDetails: BookingDetails = {
      trainId: train._id || "",
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      class: train.class,
      quota: train.quota,
      source: routeInfo.source,
      destination: routeInfo.destination,
      departureTime: routeInfo.departureTime,
      arrivalTime: routeInfo.arrivalTime,
      totalAmount: totalPrice,
      travelers: travelers,
    };

    // Store booking details in localStorage for payment page
    localStorage.setItem("bookingDetails", JSON.stringify(bookingDetails));
    router.push("/trains/payment");
  };

  return (
    <div className="w-full md:w-1/3 space-y-4">
      {/* Boarding Details */}
      <div className="bg-[#F5F5F5] p-4 rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{train.trainNumber} - {train.trainName}</p>
            <p className="text-[#07561A]">Class {train.class} • {train.quota} Quota</p>
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-sm">{routeInfo.departureTime}</p>
            <p className="text-sm text-gray-600">{routeInfo.source}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">{routeInfo.duration}</p>
            <div className="w-24 h-0.5 bg-gray-300 my-1"></div>
          </div>
          <div className="text-right">
            <p className="text-sm">{routeInfo.arrivalTime}</p>
            <p className="text-sm text-gray-600">{routeInfo.destination}</p>
          </div>
        </div>
        <button className="mt-3 text-[#07561A] text-sm border border-[#07561A] px-4 py-1 rounded-md">
          Change boarding station
        </button>
      </div>

      {/* Offers */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Offers</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/Assets/Vector.png"
                width={16}
                height={16}
                alt="check"
              />
              <span className="text-sm">50% off up to ₦100 | Use code BOOKNOW</span>
            </div>
            <button 
              onClick={() => {
                setPromoCode("BOOKNOW");
                handleApplyCode();
              }}
              className="text-[#07561A] text-sm"
            >
              Apply
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image
                src="/Assets/Vector.png"
                width={16}
                height={16}
                alt="check"
              />
              <span className="text-sm">20% off | Use code FIRSTTIME</span>
            </div>
            <button 
              onClick={() => {
                setPromoCode("FIRSTTIME");
                handleApplyCode();
              }}
              className="text-[#07561A] text-sm"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Apply Code */}
        <div className="mt-4">
          <h3 className="font-medium mb-2">Apply Code</h3>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="Enter Code"
              className="flex-1 px-0 py-2 border-t-0 border-b-2 border-x-0 border-gray-300 focus:outline-none focus:border-[#07561A] bg-transparent"
            />
            <button
              onClick={handleApplyCode}
              className="bg-[#07561A] text-white px-6 py-2 rounded-md whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Bill Details */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-medium mb-3">Bill Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Base Ticket Fare:</span>
            <span>₦{basePrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Total Travelers:</span>
            <span>{travelers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes & GST:</span>
            <span>₦{taxAndGST.toLocaleString()}</span>
          </div>
          {appliedDiscount > 0 && (
            <div className="flex justify-between text-[#07561A]">
              <span>Discount:</span>
              <span>-₦{appliedDiscount.toLocaleString()}</span>
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
        className="w-full bg-[#07561A] text-white py-3 rounded-lg font-medium"
      >
        Book Now
      </button>
    </div>
  );
};

export default BookingRight;

