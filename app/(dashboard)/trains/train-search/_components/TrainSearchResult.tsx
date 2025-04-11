"use client"
import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Image from 'next/image';
import Link from 'next/link';
import search from "../../../../../public/Assets/Searchpic.png";
import { TrainDetails } from "../_types/train.types";
import { apiService } from "../../_services/api.service";
import DateSlider from "./DateSlider";
import TrainCard from "./TrainCard";


type Breakpoint = "mobile" | "tablet" | "desktop";
const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handleBreakpointChange = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint("mobile");
      } else if (width < 1024) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    handleBreakpointChange();
    window.addEventListener("resize", handleBreakpointChange);
    return () => window.removeEventListener("resize", handleBreakpointChange);
  }, []);

  return breakpoint;
};

interface TrainSearchResultsProps {
  loading?: boolean;
}

const TrainSearchResults: React.FC<TrainSearchResultsProps> = ({ loading = false }) => {
  const [selectedDate, setSelectedDate] = useState<string>("Wed 16");
  const [trainDetails, setTrainDetails] = useState<TrainDetails[]>([]);

  useBreakpoint();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getTrainClasses();
        if (response.success) {
          setTrainDetails(response.data as unknown as TrainDetails[]);
        }
      } catch (error) {
        console.error("Error fetching train details:", error);
      }
    };
    fetchData();
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  return (
    <div className="bg-[#F5F5F5] min-h-screen w-full flex flex-col md:flex-row">
      {/* Left Section - Filters */}
      <div className="w-full px-6 py-8 lg:w-2/3">
        <h2 className="text-2xl font-semibold text-[#374151] mb-4">
          Your Search Results
        </h2>

        <div className="flex flex-col mb-6">
          <div className="flex items-center gap-6">
            <div className="border-t-0 border-x-0 border-b-2 border-[#D1D5DB] p-4">
              <p className="text-sm text-[#6B7280]">
                NDLS, New Delhi Railway Station
              </p>
            </div>

            <div className="border-t-0 w-1/2 border-x-0 border-b-2 border-[#D1D5DB] p-4">
              <p className="text-sm text-[#6B7280]">LJN, Lucknow Junction</p>
            </div>
          </div>
          <div className="flex items-center w-full h-auto mx-auto mt-4 text-center">
            <Link href="/booking-success" className="w-full py-2 px-4 bg-[#16A34A] text-white rounded-md text-sm font-medium">
              Search for trains
            </Link>
          </div>
        </div>

        <DateSlider onDateChange={handleDateChange} />
        <p className="text-sm text-[#6B7280] mt-4">Selected Date: {selectedDate}</p>
        <div className="mb-6">
          <Image src={search} alt="Train Planning" className="w-full h-auto mb-4 rounded-md" />
          <p className="text-sm font-medium">Planning your holidays?</p>
        </div>
        <div>
          <Image src={search} alt="Train Tourism" className="w-full h-auto mb-4 rounded-md" />
          <p className="text-sm font-medium">Train tourism packages</p>
          <p className="text-sm text-[#6B7280]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu eleifend magna.
          </p>
        </div>
      </div>

      {/* Right Section - Train List */}
      <div className="w-full lg:w-2/3 px-6 py-8 bg-[#F5F5F5] overflow-y-auto">
        <div className="items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#374151]">Available Trains</h2>
          <hr className="w-full h-1 bg-[#80808080]" />

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/4">
                      <Skeleton height={100} />
                    </div>
                    <div className="md:w-3/4 space-y-2">
                      <Skeleton height={24} width={200} />
                      <Skeleton height={20} width={150} />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton height={20} width={120} />
                        <Skeleton height={20} width={120} />
                      </div>
                      <Skeleton height={40} width={120} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            trainDetails.map((train) => (
              <div key={train.id} className="p-4 border rounded-lg mb-4">
                <h3 className="text-lg font-semibold">{train.trainName}</h3>
                <p className="text-sm text-gray-600">{train.departureStation} to {train.arrivalStation}</p>
                <p className="text-sm text-gray-600">Duration: {train.duration}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainSearchResults;
