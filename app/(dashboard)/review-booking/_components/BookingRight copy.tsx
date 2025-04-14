import React, { useState } from "react";
import vector from "../../../../public/Assets/Vector.png";
import Link from "next/link";
import { TrainDetails } from "@/app/api/types/types";
import Image from "next/image";
export interface TrainCardProps {
  train: TrainDetails;
}

export const BookingRight: React.FC<TrainCardProps> = ({ train }) => {
  const [applyCode, setApplyCode] = useState("");
  const [totalCharge, setTotalCharge] = useState(35000);

  const handleApplyOffer = (discount: number) => {
    const newCharge = totalCharge - discount;
    setTotalCharge(newCharge);
    alert(`Discount of ₦${discount} applied successfully!`);
  };

  const handleApplyCode = () => {
    if (applyCode === "FIRSTTIME") {
      handleApplyOffer(1000);
    } else {
      alert("Invalid code! Please try again.");
    }
    setApplyCode("");
  };
  return (
    <div>
      {/* Right Section: Boarding and Billing Details */}
      <div className="w-full  space-y-6">
        {/* Boarding Details */}
        <div className="bg-[#07561A1A] p-4 rounded-lg  border-[#07561A] shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Boarding Details
          </h3>
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-lg font-semibold">
              {train.trainName}
            </p>
            <p className="text-[#07561A]">
              <span className="font-medium ">Class 2A</span> &bull; Tatkal Quota
            </p>
          </div>
          <div className="flex justify-between mt-4">
            <div className="w-full">
              <p className="text-sm font-normal">{train.startDate} </p>
              <p className="text-sm font-medium">{train.departureTime}</p>
              <p className="text-sm  text-[#6B7280]">
                {train.departureStation}
              </p>
            </div>
            <div className="flex flex-col w-full items-center">
              <span className="text-sm text-[#6B7280]">{train.duration}</span>
              <hr className="border-t border-[#D1D5DB] w-full mt-1" />
            </div>
            <div className=" text-right w-4/5 ">
              <p className="text-sm font-normal"> {train.endDate}</p>
              <p className="text-sm font-medium">{train.arrivalTime}</p>
              <p className="text-sm text-[#6B7280]">{train.arrivalStation}</p>
            </div>
          </div>
          <button className="text-green-500 hover:underline border px-2 py-1 border-solid border-[#07561A] rounded-md mt-2">
            Change boarding station
          </button>
        </div>

        {/* Offers */}
        <div className="bg-white p-4 rounded-lg border-[2px] border-dotted border-[#07561A] shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Offers</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600 text-sm flex gap-2">
                <Image src={vector} className="object-scale-down" alt="" />
                50% off up to ₦100 | Use code{" "}
                <span className="font-medium">BOOKNOW</span>
              </p>
              <button
                onClick={() => handleApplyOffer(100)}
                className="text-[#07561A] hover:underline"
              >
                Apply
              </button>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-gray-600 flex gap-2">
                <Image src={vector} className="object-scale-down" alt="" />
                20% off | Use code{" "}
                <span className="font-medium">FIRSTTIME</span>
              </p>
              <button
                onClick={() => handleApplyOffer(200)}
                className="text-[#07561A] hover:underline"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Apply Code */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold flex gap-2 text-gray-800 mb-2">
            <Image src={vector} className="object-scale-down" alt="" />
            Apply Code
          </h3>
          <div className="flex w-full items-center gap-4">
            <input
              type="text"
              placeholder="Enter Code"
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value)}
              className="w-full border-t-0 border-x-0 border-b-2 border-gray-300  px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={handleApplyCode}
              className="bg-[#07561A] text-white px-6 py-2 rounded-md hover:bg-green-600"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Bill Details */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Bill Details
          </h3>
          <p className="text-gray-600">Base Ticket Fare: ₦30,000.00</p>
          <p className="text-gray-600">Total Travelers: 1</p>
          <p className="text-gray-600">Taxes & GST: ₦5,000.00</p>
          <p className="text-lg font-bold text-gray-800 mt-4">
            Total Charge: ₦{totalCharge}
          </p>
        </div>

        {/* Book Now Button */}
        <div className=" w-full flex text-center items-center mx-auto">
          <Link
            href="/booking-success"
            className="w-full mx-auto items-center bg-[#07561A] text-white py-2 rounded-md hover:bg-green-600"
          >
            Book Now
          </Link>
        </div>
        <button className="w-full text-red-500  ">Cancel</button>
      </div>
    </div>
  );
};
