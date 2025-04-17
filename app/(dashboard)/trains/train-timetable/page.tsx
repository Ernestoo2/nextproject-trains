"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FaArrowRight,
  FaClock,
  FaTicketAlt,
  FaTrain,
  FaCalendarAlt,
  FaUsers,
  FaInfoCircle
} from "react-icons/fa";
import { format } from 'date-fns';

// Updated interface to better match potential API response (based on ISchedule)
interface TrainSchedule {
  _id: string; // Use _id from MongoDB
  train: {
    _id: string;
    trainName: string;
    trainNumber: string;
  };
  route: {
    _id: string;
    fromStation: { name: string; code: string };
    toStation: { name: string; code: string };
    distance: number;
    estimatedDuration: string;
    baseFare: number; // Base fare for the route
  };
  departureTime: string;
  arrivalTime: string;
  date: string; // Assuming API returns date as string
  availableSeats: {
    FC: number;
    BC: number;
    SC: number;
  };
  status: string;
  fare: { // Fare per class (might be calculated on backend or frontend)
    FC: number;
    BC: number;
    SC: number;
  };
}

// Helper component to access searchParams
function TimetableContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [schedules, setSchedules] = useState<TrainSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromStationName, setFromStationName] = useState<string | null>(null);
  const [toStationName, setToStationName] = useState<string | null>(null);

  // Get booking details from URL params
  const fromStationId = searchParams.get("from");
  const toStationId = searchParams.get("to");
  const date = searchParams.get("date");
  const tripType = searchParams.get("tripType") || "ONE_WAY"; // Default tripType
  const classType = searchParams.get("classType") as keyof TrainSchedule['availableSeats'] || "SC"; // Default classType
  const adultCount = parseInt(searchParams.get("adultCount") || "1");
  const childCount = parseInt(searchParams.get("childCount") || "0");
  const infantCount = parseInt(searchParams.get("infantCount") || "0");
  const totalPassengers = adultCount + childCount; // Infants usually don't occupy seats
  const seatsNeeded = totalPassengers;

  useEffect(() => {
    if (fromStationId && toStationId && date) {
      fetchSchedules();
    } else {
      setError("Missing required search parameters (from, to, date).");
        setLoading(false);
    }
  }, [fromStationId, toStationId, date]);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      // Construct API query
      const query = new URLSearchParams({
        fromStationId: fromStationId!,
        toStationId: toStationId!,
        date: date!,
        classType: classType, // Pass classType for potential server-side filtering/fare calc
      }).toString();

      console.log(`Fetching schedules with query: /api/schedules/search?${query}`);

      const response = await fetch(`/api/schedules/search?${query}`);
        const data = await response.json();
        
      console.log("API Response:", data);

      if (response.ok && Array.isArray(data.schedules)) {
        setSchedules(data.schedules);
        // Set station names from the first schedule if available
        if (data.schedules.length > 0) {
          setFromStationName(data.schedules[0].route.fromStation.name);
          setToStationName(data.schedules[0].route.toStation.name);
        }
      } else {
        setError(data.error || "No schedules found for the selected criteria.");
        setSchedules([]); // Clear schedules on error
      }
    } catch (err: any) {
      console.error("Error fetching schedules:", err);
      setError(`An error occurred: ${err.message || "Unknown error"}`);
      setSchedules([]); // Clear schedules on error
      } finally {
        setLoading(false);
      }
    };

  const handleBooking = (schedule: TrainSchedule) => {
    // Calculate fare for the selected class and number of passengers
    const selectedClassFare = schedule.fare[classType];
    const calculatedTotalFare = selectedClassFare * (adultCount + childCount * 0.5); // Example: Children half price

    const bookingParams = new URLSearchParams({
      scheduleId: schedule._id,
      fromStationId: fromStationId!,
      toStationId: toStationId!,
      date: date!,
      tripType: tripType,
      classType: classType,
      adultCount: adultCount.toString(),
      childCount: childCount.toString(),
      infantCount: infantCount.toString(),
      trainNumber: schedule.train.trainNumber,
      trainName: schedule.train.trainName,
      departureTime: schedule.departureTime,
      arrivalTime: schedule.arrivalTime,
      estimatedDuration: schedule.route.estimatedDuration,
      totalFare: calculatedTotalFare.toString(), // Pass calculated fare
      fromStationName: schedule.route.fromStation.name, // Pass names
      toStationName: schedule.route.toStation.name, // Pass names
    });

    // Navigate to booking review page (update path if needed)
    router.push(`/booking/review?${bookingParams.toString()}`);
  };

  const formattedDate = date ? format(new Date(date), 'EEE, MMM d, yyyy') : 'N/A';

    return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Train Timetable</h1>
      <div className="mb-6 p-4 bg-gray-100 rounded-lg text-gray-700">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-1">
            <FaTrain className="text-[#07561A]"/> 
            <strong>Route:</strong> {fromStationName || 'Loading...'} 
            <FaArrowRight className="mx-1"/> {toStationName || 'Loading...'}
          </div>
          <div className="flex items-center gap-1">
            <FaCalendarAlt className="text-[#07561A]"/>
            <strong>Date:</strong> {formattedDate}
          </div>
          <div className="flex items-center gap-1">
            <FaUsers className="text-[#07561A]"/>
            <strong>Passengers:</strong> {totalPassengers} ({classType})
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#07561A]"></div>
          <p className="ml-4 text-lg">Loading schedules...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <FaInfoCircle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-700 font-semibold text-lg mb-2">Could not load schedules</p>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#07561A] text-white rounded-md hover:bg-[#064a15] transition-colors"
          >
            Go Back
          </button>
      </div>
      ) : schedules.length === 0 ? (
        <div className="text-center p-8 bg-yellow-50 rounded-lg border border-yellow-200">
          <FaInfoCircle className="text-yellow-500 text-4xl mx-auto mb-4" />
          <p className="text-yellow-700 font-semibold text-lg mb-2">No Schedules Found</p>
          <p className="text-yellow-600 mb-4">No direct train schedules match your selection for this date.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-[#07561A] text-white rounded-md hover:bg-[#064a15] transition-colors"
          >
            Try Different Date/Route
          </button>
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schedules.map((schedule) => {
            const seatsAvailable = schedule.availableSeats[classType] ?? 0;
            const farePerPassenger = schedule.fare[classType] ?? 0;
            const isSeatAvailable = seatsAvailable >= seatsNeeded;

  return (
              <div
                key={schedule._id}
                className="border rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* Card Header */}
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg text-[#07561A]">
                    {schedule.train.trainName} ({schedule.train.trainNumber})
                  </h3>
      </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-grow">
                  <div className="flex items-center justify-between text-lg">
                    <span className="font-medium">{schedule.departureTime}</span>
                    <FaArrowRight className="text-gray-400 mx-2" />
                    <span className="font-medium">{schedule.arrivalTime}</span>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                    <FaClock className="text-[#07561A]" />
                    <span>Duration: {schedule.route.estimatedDuration}</span>
              </div>
                  
                  <div className="mt-2 pt-3 border-t">
                    <div className="text-sm font-medium mb-1">Seats ({classType}):</div>
                    <div className={`text-center font-bold text-lg ${seatsAvailable < seatsNeeded ? 'text-red-600' : 'text-green-600'}`}>
                      {seatsAvailable} available
              </div>
            </div>
                  
                  <div className="text-sm font-medium mt-2">Fare ({classType}):</div>
                  <div className="text-center font-bold text-xl text-[#07561A]">
                    ₦{farePerPassenger.toLocaleString()} <span className="text-xs font-normal">per adult</span>
                  </div>
        </div>

                {/* Card Footer */}
                <div className="p-4 border-t bg-gray-50">
                  <button
                    onClick={() => handleBooking(schedule)}
                    disabled={!isSeatAvailable}
                    className={`w-full text-white py-2.5 px-4 rounded-md transition-colors text-base font-medium 
                      ${isSeatAvailable 
                        ? 'bg-[#07561A] hover:bg-[#064a15]' 
                        : 'bg-gray-400 cursor-not-allowed'}`}
                  >
                    {isSeatAvailable ? "Select Train" : "Not Enough Seats"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Wrap the main component in Suspense for searchParams usage
export default function TrainTimetablePage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#07561A]"></div>
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    }>
      <TimetableContent />
    </Suspense>
  );
}
