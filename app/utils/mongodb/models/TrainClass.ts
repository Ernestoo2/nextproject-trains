import mongoose from "mongoose";
import { z } from "zod";
import type { MongoDocument } from "@/types/shared/database";
import { TrainClassType } from "@/types/shared/trains";
 
export const CLASS_TYPE = {
  FIRST_CLASS: "First Class",
  BUSINESS: "Business",
  ECONOMY: "Economy",
  SLEEPER: "Sleeper",
  STANDARD: "Standard",
};

// Define the document interface
export interface TrainClassDocument extends MongoDocument {
  className: string;
  classCode: string;
  classType: TrainClassType;
  basePrice: number;
  capacity: number;
  amenities: string[];
  description: string;
  isActive: boolean;
}

const trainClassSchema = new mongoose.Schema<TrainClassDocument>(
  {
    className: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      minlength: [3, "Class name must be at least 3 characters long"],
      maxlength: [50, "Class name cannot exceed 50 characters"],
    },
    classCode: {
      type: String,
      required: [true, "Class code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return /^[A-Z]{2,6}\d{0,4}$/.test(v); // e.g., FC1001
        },
        message:
          "Class code must be uppercase letters followed by optional digits",
      },
    },
    classType: {
      type: String,
      enum: {
        values: ["FIRST_CLASS", "BUSINESS", "ECONOMY", "SLEEPER", "STANDARD"],
        message: "Invalid class type",
      },
      required: [true, "Class type is required"],
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Base price cannot be negative"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [1, "Capacity must be at least 1"],
      max: [1000, "Capacity cannot exceed 1000"],
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
      maxlength: [500, "Description cannot exceed 500 characters"],
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
trainClassSchema.index({ className: 1 });
trainClassSchema.index({ classType: 1 });
trainClassSchema.index({ isActive: 1 });
trainClassSchema.index({ basePrice: 1 });

// Pre-save middleware to ensure classCode is uppercase
trainClassSchema.pre("save", function (next) {
  if (this.classCode) {
    this.classCode = this.classCode.toUpperCase();
  }
  next();
});

// Virtual for formatted price
trainClassSchema
  .virtual("formattedPrice")
  .get(function (this: TrainClassDocument) {
    return this.basePrice ? `₦${this.basePrice.toLocaleString()}` : '₦0';
  });

// Virtual for display name
trainClassSchema
  .virtual("displayName")
  .get(function (this: TrainClassDocument) {
    return `${this.className} (${this.classCode})`;
  });

// Zod schema for TrainClass validation
export const TrainClassZodSchema = z.object({
  className: z.string().min(3).max(50),
  classCode: z.string().min(2).max(10),
  classType: z.enum([
    "FIRST_CLASS",
    "BUSINESS",
    "ECONOMY",
    "SLEEPER",
    "STANDARD",
  ]),
  basePrice: z.number().min(0),
  capacity: z.number().min(1).max(1000),
  amenities: z.array(z.string()),
  description: z.string().min(10).max(500),
  isActive: z.boolean(),
});

export const TrainClass =
  mongoose.models.TrainClass ||
  mongoose.model<TrainClassDocument>("TrainClass", trainClassSchema);

// IMPORTANT: After updating this schema, drop any old indexes in MongoDB referencing 'code', 'name', or 'baseFare' fields to avoid duplicate key errors.
