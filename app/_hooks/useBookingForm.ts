import { useState, useCallback } from "react";

import type { NaijaRailsProfile } from "../_providers/profile/ProfileContext";
import { useBookingState } from "./useBookingState";
import { toast } from "sonner";
import { Passenger } from "@/types/shared/trains";
import { BookingFormState, TripType, TrainClassType } from "@/types/shared/booking";

interface FormState extends BookingFormState {
  isEditingProfile: boolean;
  showAddPassengerDialog: boolean;
  showConfirmDialog: boolean;
  passengerToRemove: Passenger | null;
  newPassenger: Partial<Passenger>;
  isLoading: boolean;
}

const initialPassenger: Partial<Passenger> = {
  firstName: "",
  lastName: "",
  age: 0,
  type: "ADULT",
  identificationType: "passport",
  seatNumber: "",
  nationality: "",
  berthPreference: "LOWER",
  gender: "MALE",
};

export function useBookingForm(bookingId: string) {
  const { state, updateState } = useBookingState(bookingId);
  const [formState, setFormState] = useState<FormState>({
    departureStation: null,
    arrivalStation: null,
    date: "",
    tripType: "ONE_WAY" as TripType,
    classType: "ECONOMY" as TrainClassType,
    passengers: [],
    isEditingProfile: false,
    showAddPassengerDialog: false,
    showConfirmDialog: false,
    passengerToRemove: null,
    newPassenger: initialPassenger,
    isLoading: false,
  });

  const addPassenger = useCallback(
    async (passenger: Passenger): Promise<void> => {
      try {
        setFormState((prev) => ({ ...prev, isLoading: true }));
        const currentPassengers = state?.passengers || [];
        await updateState({
          passengers: [...currentPassengers, passenger],
        });
        setFormState((prev) => ({
          ...prev,
          showAddPassengerDialog: false,
          newPassenger: initialPassenger,
          isLoading: false,
        }));
        toast.success("Passenger added successfully");
      } catch (error) {
        toast.error("Failed to add passenger");
        setFormState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state?.passengers, updateState]
  );

  const removePassenger = useCallback(
    async (index: number): Promise<void> => {
      try {
        setFormState((prev) => ({ ...prev, isLoading: true }));
        const currentPassengers = state?.passengers || [];
        const updatedPassengers = currentPassengers.filter(
          (_: any, i: number) => i !== index
        );
        await updateState({ passengers: updatedPassengers });
        setFormState((prev) => ({
          ...prev,
          showConfirmDialog: false,
          passengerToRemove: null,
          isLoading: false,
        }));
        toast.success("Passenger removed successfully");
      } catch (error) {
        toast.error("Failed to remove passenger");
        setFormState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state?.passengers, updateState]
  );

  const updateProfile = useCallback(
    async (profile: Partial<NaijaRailsProfile>): Promise<void> => {
      try {
        setFormState((prev) => ({ ...prev, isLoading: true }));
        // API call to update profile would go here
        setFormState((prev) => ({
          ...prev,
          isEditingProfile: false,
          isLoading: false,
        }));
        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error("Failed to update profile");
        setFormState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  const setNewPassengerField = useCallback(
    (field: keyof Passenger, value: any): void => {
      setFormState((prev) => ({
        ...prev,
        newPassenger: {
          ...prev.newPassenger,
          [field]: value,
        },
      }));
    },
    []
  );

  return {
    formState,
    setFormState,
    addPassenger,
    removePassenger,
    updateProfile,
    setNewPassengerField,
  };
}
