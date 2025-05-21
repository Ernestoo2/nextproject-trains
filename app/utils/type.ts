import { ApiResponse } from "@/types/shared/api";
import {
  UnifiedTrainDetails as TrainDetails,
  LegacyTrainDetails,
  TrainCardProps,
  TRAIN_CLASSES,
  TRIP_TYPES,
  TripType,
  TrainClassType,
} from "@/types/shared/trains";

import { UserProfile, } from "@/types/shared/users"; 

import { Payment, PaymentMethod } from "@/types/shared/payments";

export interface SelectorProps {
  value: string;
  onChange: (value: string) => void;
}

// Re-export types
export type {
  ApiResponse,
  TrainDetails,
  LegacyTrainDetails,
  TrainCardProps,
  TripType,
  TrainClassType,
  UserProfile, 
  Payment,
  PaymentMethod,
};

// Re-export constants
export { TRAIN_CLASSES, TRIP_TYPES };
