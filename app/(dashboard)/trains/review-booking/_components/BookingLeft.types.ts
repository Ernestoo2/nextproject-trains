import { Schedule } from "@/types/shared/database";
import { BookingFormState, Passenger } from "@/types/shared/booking";
import { UserProfile } from "@/types/shared/users";

export type BerthPreference = "lower" | "middle" | "upper" | "side";

export interface BookingLeftProps {
  bookingId: string;
  schedule: Schedule;
}

export interface ExtendedBookingFormState extends BookingFormState {
  isEditingProfile: boolean;
  showAddPassengerDialog: boolean;
  showConfirmDialog: boolean;
  passengerToRemove: Passenger | null;
  newPassenger: Partial<Passenger>;
  isLoading: boolean;
}

export interface ProfileUpdateData {
  fullName: string;
  phoneNumber: string;
  defaultNationality: string;
  preferredBerth: BerthPreference;
}

export interface PassengerFormData extends Partial<Passenger> {
  firstName: string;
  lastName: string;
  age: number;
  phone: string;
  type: "ADULT" | "CHILD" | "INFANT";
  gender: "MALE" | "FEMALE" | "OTHER";
  nationality: string;
  berthPreference: "LOWER" | "MIDDLE" | "UPPER";
}
