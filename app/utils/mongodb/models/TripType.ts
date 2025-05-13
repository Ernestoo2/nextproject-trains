import mongoose, { Document } from "mongoose";
import { TRIP_TYPES, TripType as TripTypeValue } from "@/types/shared/trains";
import { z } from "zod";

// Define the document interface
interface TripTypeDocument extends Document {
  name: TripTypeValue;
  code: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const tripTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: Object.values(TRIP_TYPES),
    },
    code: {
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Export the model
export const TripType =
  mongoose.models.TripType ||
  mongoose.model<TripTypeDocument>("TripType", tripTypeSchema);

// Zod schema for TripType validation
export const TripTypeZodSchema = z.object({
  name: z.string().min(1), // Should match TRIP_TYPES
  code: z.string().min(1),
  isActive: z.boolean(),
});
