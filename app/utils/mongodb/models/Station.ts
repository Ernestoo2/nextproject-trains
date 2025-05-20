import mongoose, { Types } from "mongoose";
import type { MongoDocument } from "@/types/shared/database"; 
import { z } from "zod";

// Define the document interface
export interface StationDocument extends Omit<MongoDocument, '_id'> {
  _id: Types.ObjectId;
  stationName: string;
  stationCode: string;
  city: string;
  state: string;
  region: string;
  address: string;
  facilities: string[];
  platforms: number;
  isActive: boolean;
}

// Define the lean document interface for query results
export interface StationLeanDocument {
  _id: Types.ObjectId;
  stationName: string;
  stationCode: string;
  city: string;
  state: string;
  region: string;
  address: string;
  facilities: string[];
  platforms: number;
  isActive: boolean;
  __v: number;
}

const stationSchema = new mongoose.Schema<StationDocument>(
  {
    stationName: {
      type: String,
      required: [true, "Station name is required"],
      trim: true,
      minlength: [3, "Station name must be at least 3 characters long"],
      maxlength: [100, "Station name cannot exceed 100 characters"],
    },
    stationCode: {
      type: String,
      required: [true, "Station code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Z]{3}$/.test(v);
        },
        message: "Station code must be exactly 3 uppercase letters",
      },
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    region: {
      type: String,
      required: [true, "Region is required"],
      trim: true,
      enum: {
        values: ["North", "South", "East", "West", "Central", "Northeast"],
        message: "Invalid region specified",
      },
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    facilities: [
      {
        type: String,
        trim: true,
      },
    ],
    platforms: {
      type: Number,
      required: [true, "Number of platforms is required"],
      min: [1, "Station must have at least 1 platform"],
      max: [20, "Station cannot have more than 20 platforms"],
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create indexes for better query performance 
stationSchema.index({ isActive: 1 });
stationSchema.index({ region: 1 });
stationSchema.index({ state: 1 });
stationSchema.index({ stationName: "text", city: "text" });

// Pre-save middleware to ensure stationCode is uppercase
stationSchema.pre("save", function (next) {
  if (this.stationCode) {
    this.stationCode = this.stationCode.toUpperCase();
  }
  next();
});

// Virtual for full station name
stationSchema.virtual("fullStationName").get(function (this: StationDocument) {
  return `${this.stationName} (${this.stationCode})`;
});

// Zod schema for Station validation
export const StationZodSchema = z.object({
  stationName: z.string().min(3).max(100),
  stationCode: z
    .string()
    .length(3)
    .regex(/^[A-Z]{3}$/),
  city: z.string().min(1),
  state: z.string().min(1),
  region: z.enum(["North", "South", "East", "West", "Central", "Northeast"]),
  address: z.string().min(1),
  facilities: z.array(z.string()).optional(),
  platforms: z.number().min(1).max(20),
  isActive: z.boolean(),
});

export const Station =
  mongoose.models.Station ||
  mongoose.model<StationDocument>("Station", stationSchema);
