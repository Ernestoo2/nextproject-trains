"use client";

import React, { useState, useEffect } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { BERTH_PREFERENCES, GENDER } from "@/types/booking.types";
import type { Passenger, TrainClass } from "@/types/shared/trains";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, UserCircle, Mail, Phone, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react"; 
import { UserProfile } from "@/types/shared/users";
const DEFAULT_NATIONALITY = "Nigerian";

type NewTravelerFormState = {
  firstName: string;
  lastName: string;
  age: string;
  gender: typeof GENDER[keyof typeof GENDER];
  nationality: string;
  berthPreference: typeof BERTH_PREFERENCES[keyof typeof BERTH_PREFERENCES];
  selectedClassId: string;
};

const BookingLeft: React.FC = () => {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const { bookingState, actions: bookingActions } = useBookingStore();
  const [showAddPassengerDialog, setShowAddPassengerDialog] = useState(false);
  const [isAddingTraveler, setIsAddingTraveler] = useState(false);
 
  const initialNewTravelerState = (): NewTravelerFormState => ({
    firstName: "",
    lastName: "",
    age: "",
    gender: GENDER.MALE,
    nationality: DEFAULT_NATIONALITY,
    berthPreference: BERTH_PREFERENCES.LOWER,
    selectedClassId: "",
  });

  const [newTraveler, setNewTraveler] = useState<NewTravelerFormState>(initialNewTravelerState());

  useEffect(() => {
    fetchUserProfile();
  }, [session?.user?.id]);

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`/api/user/${session.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      if (data.success && data.data) setUser(data.data);
    } catch (error) {
      toast.error('Error loading profile');
    } finally { setIsLoadingProfile(false); }
  };

  useEffect(() => {
      setNewTraveler(prev => ({
        ...prev,
      nationality: user?.defaultNationality || DEFAULT_NATIONALITY,
      berthPreference: (user?.preferredBerth as typeof BERTH_PREFERENCES[keyof typeof BERTH_PREFERENCES]) || BERTH_PREFERENCES.LOWER,
      selectedClassId: bookingState.currentDefaultClassId || 
        (bookingState.scheduleDetails?.availableClasses[0]?.classCode || 
         bookingState.scheduleDetails?.availableClasses[0]?._id || ""),
      }));
  }, [user, bookingState.currentDefaultClassId, bookingState.scheduleDetails?.availableClasses]);

  const handleAddTraveler = () => {
    setIsAddingTraveler(true);
    if (!newTraveler.firstName || !newTraveler.lastName || !newTraveler.age || !newTraveler.selectedClassId) {
      toast.error("Please fill in all required fields, including travel class.");
      setIsAddingTraveler(false);
      return;
    }

    // Validate that the selected class exists
    const selectedClass = bookingState.scheduleDetails?.availableClasses.find(
      cls => cls.classCode === newTraveler.selectedClassId || cls._id === newTraveler.selectedClassId
    );

    if (!selectedClass) {
      toast.error("Selected class is no longer available. Please choose another class.");
      setIsAddingTraveler(false);
      return;
    }

    const ageAsNumber = parseInt(newTraveler.age, 10);
    if (isNaN(ageAsNumber) || ageAsNumber < 0) {
      toast.error("Please enter a valid age.");
      setIsAddingTraveler(false);
      return;
    }
    if (bookingState.passengers.length >= 6) {
      toast.error("You can book up to 6 travelers at once.");
      setIsAddingTraveler(false);
      return;
    }

    const passengerToAdd: Passenger = {
      firstName: newTraveler.firstName,
      lastName: newTraveler.lastName,
      age: ageAsNumber,
      gender: newTraveler.gender,
      nationality: newTraveler.nationality,
      berthPreference: newTraveler.berthPreference,
      selectedClassId: selectedClass.classCode || selectedClass._id,
      type: "ADULT",
    };

    bookingActions.addPassenger(passengerToAdd);
    toast.success("Traveler added successfully!");
    setNewTraveler(initialNewTravelerState());
    setShowAddPassengerDialog(false);
    setIsAddingTraveler(false);
  };

  const handleRemoveTraveler = (index: number) => {
    bookingActions.removePassenger(index);
    toast.success("Traveler removed successfully!");
  };
  
  const availableClassesForDropdown = bookingState.scheduleDetails?.availableClasses || [];

  return (
    <div className="w-full flex-1 space-y-6">
      <h2 className="text-2xl font-semibold text-[#07561A]">Review your booking</h2>

      {/* User Profile Section */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Naija Rails Profile</h3>
          {!isLoadingProfile && user && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNewTraveler(initialNewTravelerState());
                setShowAddPassengerDialog(true);
              }}
              className="text-[#07561A] hover:text-[#064516] border-[#07561A] hover:bg-[#07561A]/10"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Traveler
            </Button>
          )}
        </div>

        {isLoadingProfile ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ) : !user ? (
          <div className="text-center text-gray-500 py-4">
            <p className="font-medium text-yellow-700">Profile Not Loaded</p>
            <p className="text-sm text-yellow-600">Please wait while we load your profile...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center p-2.5">
              <UserCircle className="w-5 h-5 mr-3 text-slate-500 flex-shrink-0" />
              <span className="font-medium text-slate-600">Naija Rails ID:</span>
              <span className="ml-auto font-mono text-green-700 text-base">{user.naijaRailsId}</span>
            </div>
            <div className="flex items-center py-2">
              <UserCircle className="w-5 h-5 mr-3 text-slate-500 flex-shrink-0" />
              <span className="text-slate-600">Full Name:</span>
              <span className="ml-auto text-slate-800 font-medium">{user.name || "Not set"}</span>
            </div>
            <div className="flex items-center py-2">
              <Mail className="w-5 h-5 mr-3 text-slate-500 flex-shrink-0" />
              <span className="text-slate-600">Email:</span>
              <span className="ml-auto text-slate-800 font-medium">{user.email || "Not set"}</span>
            </div>
            <div className="flex items-center py-2">
              <Phone className="w-5 h-5 mr-3 text-slate-500 flex-shrink-0" />
              <span className="text-slate-600">Phone:</span>
              <span className="ml-auto text-slate-800 font-medium">{user.phone || "Not set"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Traveler Details */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 text-md">Traveler Details</h3>
          <p className="text-sm text-gray-600">
            As per guidelines, you can book up to 6 travelers at once.
          </p>
        </div>

        <ol className="space-y-4">
          {bookingState.passengers.map((traveler, index) => {
            const travelerClass = availableClassesForDropdown.find(c => c.classCode === traveler.selectedClassId || c._id === traveler.selectedClassId);
            return (
            <li key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                <span className="font-medium text-gray-800">{traveler.firstName} {traveler.lastName}</span>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">{travelerClass?.className || traveler.selectedClassId}</span>
                <button
                  onClick={() => handleRemoveTraveler(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{traveler.age} yrs</span>
                  <span>{traveler.gender}</span>
              </div>
            </li>
            );
          })}
        </ol>

        {bookingState.passengers.length === 0 && (
          <p className="text-sm text-center text-gray-500 py-6 border border-dashed border-gray-300 rounded-md bg-gray-50">
            No travelers added yet. Click "Add Traveler" to begin.
          </p>
        )}
      </div>

      {/* Contact Details */}
      <div className="p-4 mb-6 rounded-lg ">
        <div className="flex items-center justify-between w-4/5 mb-3">
          <h3 className="text-lg font-semibold text-gray-800">Contact Details</h3>
          <p className="text-sm">Your ticket info will be sent here</p>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Label className="text-sm text-gray-600">Mobile Number</Label>
            <Input
              type="tel"
              value={user?.phone || ""}
              readOnly
              className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex-1">
            <Label className="text-sm text-gray-600">Email ID</Label>
            <Input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full px-4 py-2 border-t-0 border-b-2 border-gray-300 border-x-0 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Add Traveler Dialog */}
      {showAddPassengerDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Add New Traveler</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newTraveler.firstName}
                    onChange={(e) => setNewTraveler({ ...newTraveler, firstName: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newTraveler.lastName}
                    onChange={(e) => setNewTraveler({ ...newTraveler, lastName: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="travelClass">Travel Class</Label>
                  <select
                    id="travelClass"
                    value={newTraveler.selectedClassId}
                    onChange={(e) => setNewTraveler({ ...newTraveler, selectedClassId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="" disabled>Select a class</option>
                    {availableClassesForDropdown.map((tc) => (
                      <option 
                        key={tc.classCode || tc._id} 
                        value={tc.classCode || tc._id}
                      >
                        {tc.className} (₦{tc.fare?.toLocaleString() || tc.basePrice?.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newTraveler.age}
                    onChange={(e) => setNewTraveler({ ...newTraveler, age: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    value={newTraveler.gender}
                    onChange={(e) => setNewTraveler({ ...newTraveler, gender: e.target.value as typeof GENDER[keyof typeof GENDER] })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.values(GENDER).map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={newTraveler.nationality}
                    onChange={(e) => setNewTraveler({ ...newTraveler, nationality: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="berthPreference">Berth Preference</Label>
                  <select
                    id="berthPreference"
                    value={newTraveler.berthPreference}
                    onChange={(e) => setNewTraveler({ ...newTraveler, berthPreference: e.target.value as typeof BERTH_PREFERENCES[keyof typeof BERTH_PREFERENCES] })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  >
                    {Object.values(BERTH_PREFERENCES).map(bp => <option key={bp} value={bp}>{bp}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setShowAddPassengerDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTraveler} disabled={isAddingTraveler || !newTraveler.selectedClassId}>
                {isAddingTraveler ? "Adding..." : "Add Traveler"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingLeft;
