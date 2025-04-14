"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/app/_providers/user/UserContext";

interface Traveler {
  name: string;
  age: string;
  gender: string;
  nationality: string;
  berthPreference: string;
}

const BookingLeft: React.FC = () => {
  const { data: session } = useSession();
  const { userProfile, updateUserProfile } = useUser();
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [newTraveler, setNewTraveler] = useState<Traveler>({
    name: "",
    age: "",
    gender: "male",
    nationality: "Nigerian",
    berthPreference: "lower",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    defaultNationality: "Nigerian",
    preferredBerth: "lower",
  });

  useEffect(() => {
    if (userProfile) {
      setProfileForm({
        fullName: userProfile.fullName,
        phone: userProfile.phone,
        defaultNationality: userProfile.defaultNationality,
        preferredBerth: userProfile.preferredBerth,
      });

      // Pre-fill new traveler with user's preferences
      setNewTraveler(prev => ({
        ...prev,
        name: userProfile.fullName,
        nationality: userProfile.defaultNationality,
        berthPreference: userProfile.preferredBerth,
      }));
    }
  }, [userProfile]);

  const handleAddTraveler = () => {
    if (!newTraveler.name || !newTraveler.age) {
      alert("Please fill in all required fields");
      return;
    }
    setTravelers([...travelers, newTraveler]);
    setNewTraveler({
      name: userProfile?.fullName || "",
      age: "",
      gender: "male",
      nationality: userProfile?.defaultNationality || "Nigerian",
      berthPreference: userProfile?.preferredBerth || "lower",
    });
  };

  const handleRemoveTraveler = (index: number) => {
    setTravelers(travelers.filter((_, i) => i !== index));
  };

  const handleUpdateProfile = () => {
    updateUserProfile({
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      defaultNationality: profileForm.defaultNationality,
      preferredBerth: profileForm.preferredBerth,
    });
    setIsEditingProfile(false);
  };

  return (
    <div className="w-full md:w-2/3">
      {/* Naija Rails Profile */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Naija Rails Profile</h2>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-[#07561A] hover:text-[#064516] font-medium"
          >
            {isEditingProfile ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.fullName}
                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Nationality
              </label>
              <select
                value={profileForm.defaultNationality}
                onChange={(e) => setProfileForm({ ...profileForm, defaultNationality: e.target.value })}
                className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A] bg-white"
              >
                <option value="Nigerian">Nigerian</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Berth
              </label>
              <select
                value={profileForm.preferredBerth}
                onChange={(e) => setProfileForm({ ...profileForm, preferredBerth: e.target.value })}
                className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A] bg-white"
              >
                <option value="lower">Lower Berth</option>
                <option value="middle">Middle Berth</option>
                <option value="upper">Upper Berth</option>
                <option value="side_lower">Side Lower</option>
                <option value="side_upper">Side Upper</option>
              </select>
            </div>
            <button
              onClick={handleUpdateProfile}
              className="w-full bg-[#07561A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#064516] transition-colors"
            >
              Save Profile
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Naija Rails ID:</span>
              <span className="text-[#07561A] font-mono">{userProfile?.naijaRailsId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Full Name:</span>
              <span>{userProfile?.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email:</span>
              <span>{userProfile?.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone:</span>
              <span>{userProfile?.phone || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Default Nationality:</span>
              <span>{userProfile?.defaultNationality}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Preferred Berth:</span>
              <span>{userProfile?.preferredBerth}</span>
            </div>
          </div>
        )}
      </div>

      {/* Traveler Details */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Traveler Details</h2>
          <p className="text-sm text-gray-600">As per IRCTC guidelines, you can book up to 6 travelers at once.</p>
        </div>

        {/* Add New Traveler Form */}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name of Traveller"
            value={newTraveler.name}
            onChange={(e) =>
              setNewTraveler({ ...newTraveler, name: e.target.value })
            }
            className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A] placeholder-gray-400"
          />

          <input
            type="number"
            placeholder="Age"
            value={newTraveler.age}
            onChange={(e) =>
              setNewTraveler({ ...newTraveler, age: e.target.value })
            }
            className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A] placeholder-gray-400"
          />

          <select
            value={newTraveler.gender}
            onChange={(e) =>
              setNewTraveler({ ...newTraveler, gender: e.target.value })
            }
            className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A] bg-white"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            value={newTraveler.nationality}
            onChange={(e) =>
              setNewTraveler({ ...newTraveler, nationality: e.target.value })
            }
            className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A] bg-white"
          >
            <option value="Nigerian">Nigerian</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={newTraveler.berthPreference}
            onChange={(e) =>
              setNewTraveler({ ...newTraveler, berthPreference: e.target.value })
            }
            className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 focus:outline-none focus:border-[#07561A] bg-white"
          >
            <option value="lower">Lower Berth</option>
            <option value="middle">Middle Berth</option>
            <option value="upper">Upper Berth</option>
            <option value="side_lower">Side Lower</option>
            <option value="side_upper">Side Upper</option>
          </select>

          <button
            onClick={handleAddTraveler}
            className="w-full bg-[#07561A] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#064516] transition-colors"
          >
            Save Traveler
          </button>
        </div>

        {/* Existing Travelers List */}
        {travelers.map((traveler, index) => (
          <div key={index} className="mt-4 p-4 border-2 border-gray-100 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900">{traveler.name}</span>
                <div className="text-sm text-gray-600">
                  <span>{traveler.age} yrs • </span>
                  <span>{traveler.gender} • </span>
                  <span>{traveler.nationality} • </span>
                  <span>{traveler.berthPreference} berth</span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveTraveler(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Details */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Contact Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={userProfile?.email || ""}
              disabled
              className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={userProfile?.phone || ""}
              disabled
              className="w-full px-4 py-2 border-2 rounded-lg border-gray-200 bg-gray-50"
            />
            <p className="text-sm text-gray-600 mt-1">
              To update contact details, please edit your profile above.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingLeft;
