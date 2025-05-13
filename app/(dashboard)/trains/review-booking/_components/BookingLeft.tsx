"use client";

import React from "react";
import { useUser } from "@/_providers/user/UserContext";
import { useProfile } from "@/_providers/profile/ProfileContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useBookingState } from "@/_hooks/useBookingState";
import { useBookingForm } from "@/_hooks/useBookingForm";
import { Schedule, Passenger } from "@/types/shared/trains";
import { toast } from "sonner";
import { 
  BookingLeftProps, 
  ExtendedBookingFormState, 
  ProfileUpdateData, 
  PassengerFormData 
} from "./BookingLeft.types";

const defaultPassenger: PassengerFormData = {
  firstName: "",
  lastName: "",
  age: 0,
  gender: "OTHER",
  nationality: "Nigerian",
  berthPreference: "LOWER",
  phone: "",
  type: "ADULT"
};

export function BookingLeft({ bookingId, schedule }: BookingLeftProps) {
  const { userProfile } = useUser();
  const { profile, updateProfile: updateUserProfile } = useProfile();
  const { state } = useBookingState(bookingId);
  const {
    formState,
    setFormState,
    addPassenger,
    removePassenger,
    updateProfile,
    setNewPassengerField,
  } = useBookingForm(bookingId);

  const {
    isEditingProfile,
    showAddPassengerDialog,
    showConfirmDialog,
    passengerToRemove,
    newPassenger,
    isLoading,
  } = formState as ExtendedBookingFormState;

  if (!state || !profile) {
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const profileData: ProfileUpdateData = {
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber,
      defaultNationality: profile.defaultNationality,
      preferredBerth: profile.preferredBerth,
    };
    await updateProfile(profileData);
  };

  const handleAddPassenger = async () => {
    if (!newPassenger.firstName || !newPassenger.lastName || !newPassenger.age || !newPassenger.phone) {
      toast.error("Please fill in all required fields");
      return;
    }
    await addPassenger(newPassenger as PassengerFormData);
  };

  const handleNewPassengerField = (field: keyof PassengerFormData, value: any) => {
    setNewPassengerField(field, value);
  };

  return (
    <div className="w-full space-y-6">
      {/* Naija Rails Profile */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Naija Rails Profile
          </h2>
          <Button
            variant="outline"
            onClick={() =>
              setFormState((prev) => ({
                ...prev,
                isEditingProfile: !prev.isEditingProfile,
              }))
            }
            className="text-[#07561A] hover:text-[#064516] border-[#07561A] hover:bg-[#07561A]/10"
          >
            {isEditingProfile ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) =>
                  updateUserProfile({ ...profile, fullName: e.target.value })
                }
                disabled={isLoading}
                className="focus:border-[#07561A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={profile.phoneNumber}
                onChange={(e) =>
                  updateUserProfile({ ...profile, phoneNumber: e.target.value })
                }
                disabled={isLoading}
                className="focus:border-[#07561A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultNationality">Default Nationality</Label>
              <Input
                id="defaultNationality"
                value={profile.defaultNationality}
                onChange={(e) =>
                  updateUserProfile({
                    ...profile,
                    defaultNationality: e.target.value,
                  })
                }
                disabled={isLoading}
                className="focus:border-[#07561A]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredBerth">Preferred Berth</Label>
              <Select
                value={profile.preferredBerth}
                onValueChange={(value) =>
                  updateUserProfile({ ...profile, preferredBerth: value as any })
                }
                disabled={isLoading}
              >
                <SelectTrigger className="focus:border-[#07561A]">
                  <SelectValue placeholder="Select berth" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lower">Lower Berth</SelectItem>
                  <SelectItem value="middle">Middle Berth</SelectItem>
                  <SelectItem value="upper">Upper Berth</SelectItem>
                  <SelectItem value="side">Side Berth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#07561A] hover:bg-[#064516] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="font-medium">Naija Rails ID:</span>
              <span className="text-[#07561A] font-mono">
                {profile.naijaRailsId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Full Name:</span>
              <span>{profile.fullName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email:</span>
              <span>{profile.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Phone:</span>
              <span>{profile.phoneNumber || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Default Nationality:</span>
              <span>{profile.defaultNationality}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Preferred Berth:</span>
              <span>{profile.preferredBerth}</span>
            </div>
          </div>
        )}
      </div>

      {/* Traveler Details */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Traveler Details
          </h2>
          <p className="text-sm text-gray-600">
            As per IRCTC guidelines, you can book up to 6 travelers at once.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() =>
            setFormState((prev) => ({ ...prev, showAddPassengerDialog: true }))
          }
          disabled={!profile || isLoading}
          className="w-full mb-4 text-[#07561A] hover:text-[#064516] border-[#07561A] hover:bg-[#07561A]/10"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Passenger
        </Button>

        {/* Existing Passengers List */}
        {state.passengers?.map((passenger: Passenger, index: number) => (
          <div
            key={index}
            className="mt-4 p-4 border-2 border-gray-100 rounded-lg"
          >
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900">
                  {passenger.firstName} {passenger.lastName}
                </span>
                <div className="text-sm text-gray-600">
                  <span>{passenger.age} yrs • </span>
                  <span>{passenger.gender} • </span>
                  <span>{passenger.nationality} • </span>
                  <span>{passenger.berthPreference} berth</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFormState((prev) => ({
                    ...prev,
                    passengerToRemove: passenger,
                    showConfirmDialog: true,
                  }));
                }}
                disabled={isLoading}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Details */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Contact Details
        </h2>
        <div className="space-y-4">
          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={profile.email || ""}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              value={profile.phoneNumber || ""}
              disabled
              className="bg-gray-50"
            />
            <p className="text-sm text-gray-600 mt-1">
              To update contact details, please edit your profile above.
            </p>
          </div>
        </div>
      </div>

      {/* Add Passenger Dialog */}
      <Dialog
        open={showAddPassengerDialog}
        onOpenChange={(open) =>
          setFormState((prev) => ({
            ...prev,
            showAddPassengerDialog: open,
            newPassenger: open ? prev.newPassenger : defaultPassenger,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Passenger</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input
                value={newPassenger.firstName || ""}
                onChange={(e) => handleNewPassengerField("firstName", e.target.value)}
                placeholder="Enter first name"
                className="focus:border-[#07561A]"
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input
                value={newPassenger.lastName || ""}
                onChange={(e) => handleNewPassengerField("lastName", e.target.value)}
                placeholder="Enter last name"
                className="focus:border-[#07561A]"
              />
            </div>
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                value={newPassenger.age || ""}
                onChange={(e) => handleNewPassengerField("age", parseInt(e.target.value) || 0)}
                placeholder="Enter age"
                className="focus:border-[#07561A]"
              />
            </div>
            <div className="space-y-2">
            <Label>Gender</Label>
            <Select
                value={newPassenger.gender || "other"}
                onValueChange={(value) => handleNewPassengerField("gender", value)}
              >
                <SelectTrigger className="focus:border-[#07561A]">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
            <Label>Nationality</Label>
              <Input
                value={newPassenger.nationality || ""}
                onChange={(e) => handleNewPassengerField("nationality", e.target.value)}
                placeholder="Enter nationality"
                className="focus:border-[#07561A]"
              />
          </div>
            <div className="space-y-2">
            <Label>Berth Preference</Label>
            <Select
                value={newPassenger.berthPreference || "lower"}
                onValueChange={(value) => handleNewPassengerField("berthPreference", value)}
            >
                <SelectTrigger className="focus:border-[#07561A]">
                <SelectValue placeholder="Select berth preference" />
              </SelectTrigger>
              <SelectContent>
                  <SelectItem value="LOWER">Lower Berth</SelectItem>
                  <SelectItem value="MIDDLE">Middle Berth</SelectItem>
                  <SelectItem value="UPPER">Upper Berth</SelectItem>
              </SelectContent>
            </Select>
          </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={newPassenger.phone || ""}
                onChange={(e) => handleNewPassengerField("phone", e.target.value)}
                placeholder="Enter phone number"
                className="focus:border-[#07561A]"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setFormState((prev) => ({
                  ...prev,
                  showAddPassengerDialog: false,
                  newPassenger: defaultPassenger,
                }))
              }
              disabled={isLoading}
              className="text-[#07561A] hover:text-[#064516] border-[#07561A] hover:bg-[#07561A]/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPassenger}
              disabled={isLoading}
              className="bg-[#07561A] hover:bg-[#064516] text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Passenger"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Passenger Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={(open) =>
          setFormState((prev) => ({ ...prev, showConfirmDialog: open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Passenger</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to remove this passenger?</p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() =>
                setFormState((prev) => ({ ...prev, showConfirmDialog: false }))
              }
              disabled={isLoading}
              className="text-[#07561A] hover:text-[#064516] border-[#07561A] hover:bg-[#07561A]/10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (passengerToRemove && state.passengers) {
                  removePassenger(state.passengers.indexOf(passengerToRemove));
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
