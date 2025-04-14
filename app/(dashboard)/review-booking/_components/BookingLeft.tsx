"use client";

import React, { useState } from "react";
import { FaTrash } from "react-icons/fa6";
import { useSession } from "next-auth/react";

interface Traveler {
  name: string;
  age: string;
  gender: string;
  nationality: string;
  berthPreference: string;
}

const BookingLeft: React.FC = () => {
  const { data: session } = useSession();
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [newTraveler, setNewTraveler] = useState<Traveler>({
    name: session?.user?.name || "",
    age: "",
    gender: "",
    nationality: "",
    berthPreference: "",
  });
  const [nairaRailsID, setNairaRailsID] = useState("");
  const [contactDetails, setContactDetails] = useState({
    phone: "",
    email: session?.user?.email || "",
  });

  const addTraveler = () => {
    if (
      newTraveler.name &&
      newTraveler.age &&
      newTraveler.gender &&
      newTraveler.nationality &&
      newTraveler.berthPreference
    ) {
      setTravelers([...travelers, newTraveler]);
      setNewTraveler({
        name: "",
        age: "",
        gender: "",
        nationality: "",
        berthPreference: "",
      });
    } else {
      alert("Please fill in all fields before adding a traveler.");
    }
  };

  const removeTraveler = (index: number) => {
    setTravelers(travelers.filter((_, i) => i !== index));
  };

  const handleNairaRailsVerification = () => {
    if (nairaRailsID.trim()) {
      alert(`Naira Rails ID "${nairaRailsID}" verified successfully!`);
    } else {
      alert("Please enter a valid Naira Rails User ID.");
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6">
      <h2 className="text-2xl font-semibold text-[#07561A]">
        Review your booking
      </h2>

      {/* Traveler Details */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-md">
            Traveler Details
          </h3>
          <p className="text-sm text-gray-600">
            As per IRCTC guidelines, you can book up to 6 travelers at once.
          </p>
          <img
            src="../Assets/plussign.png"
            className="object-scale-down w-10 h-10"
            alt=""
          />
        </div>

        <ol className="space-y-4">
          {travelers.map((traveler, index) => (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-800">
                  {traveler.name}
                </span>
                <button
                  title="button"
                  onClick={() => removeTraveler(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{traveler.age}</span>
                <span className="text-sm text-gray-600">{traveler.gender}</span>
                <span className="text-sm text-gray-600">
                  {traveler.nationality}
                </span>
                <span className="text-sm text-gray-600">
                  {traveler.berthPreference}
                </span>
              </div>
            </li>
          ))}
        </ol>

        <div className="gap-4 mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Name of Traveller"
              value={newTraveler.name}
              onChange={(e) =>
                setNewTraveler({ ...newTraveler, name: e.target.value })
              }
              className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Age"
              value={newTraveler.age}
              onChange={(e) =>
                setNewTraveler({ ...newTraveler, age: e.target.value })
              }
              className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="relative w-full">
              <select
                title="Gender"
                value={newTraveler.gender}
                onChange={(e) =>
                  setNewTraveler({ ...newTraveler, gender: e.target.value })
                }
                className="w-full px-4 py-2 bg-transparent border-t-0 border-b-2 border-gray-300 appearance-none border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option className="text-gray-500" value="" disabled hidden>
                  Gender
                </option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
            <input
              type="text"
              placeholder="Nationality"
              value={newTraveler.nationality}
              onChange={(e) =>
                setNewTraveler({ ...newTraveler, nationality: e.target.value })
              }
              className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <input
              type="text"
              placeholder="Berth Preference"
              value={newTraveler.berthPreference}
              onChange={(e) =>
                setNewTraveler({
                  ...newTraveler,
                  berthPreference: e.target.value,
                })
              }
              className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={addTraveler}
            className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>

      {/* Naira Rails Login */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
        <h3 className="mb-2 text-lg font-semibold text-gray-800">
          Naira Rails Login
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter Naira Rails User ID"
            value={nairaRailsID}
            onChange={(e) => setNairaRailsID(e.target.value)}
            className="flex-1 px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleNairaRailsVerification}
            className="px-6 py-2 text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            Verify
          </button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between w-4/5 mb-3">
          <h3 className="text-lg font-semibold text-gray-800">
            Contact Details
          </h3>
          <p className="text-sm">Your ticket info will be sent here</p>
        </div>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Mobile Number"
            value={contactDetails.phone}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, phone: e.target.value })
            }
            className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <input
            type="email"
            placeholder="Email ID"
            value={contactDetails.email}
            onChange={(e) =>
              setContactDetails({ ...contactDetails, email: e.target.value })
            }
            className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
};

export default BookingLeft;
