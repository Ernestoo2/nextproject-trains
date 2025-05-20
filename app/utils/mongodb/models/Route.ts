import mongoose, {Schema } from "mongoose"; 
import type { MongoDocument } from "@/types/shared/database";
import { z } from "zod";

// Define the document interface
export interface RouteDocument extends MongoDocument {
  routeName: string;
  routeCode: string;
  fromStation: Schema.Types.ObjectId;
  toStation: Schema.Types.ObjectId;
  distance: number;
  baseFare: number;
  estimatedDuration: string;
  availableClasses: Schema.Types.ObjectId[];
  isActive: boolean;
}

const routeSchema = new Schema<RouteDocument>(
  {
    routeName: {
      type: String,
      required: true,
      trim: true,
    },
    routeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    fromStation: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    toStation: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    distance: {
      type: Number,
      required: true,
      min: [1, "Distance must be greater than 0"],
    },
    baseFare: {
      type: Number,
      required: true,
      min: [0, "Base fare cannot be negative"],
    },
    estimatedDuration: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^([0-9]+h\s)?[0-9]+m$/.test(v);
        },
        message: "Duration must be in format: 2h 30m or 45m",
      },
    },
    availableClasses: [
      {
        type: Schema.Types.ObjectId,
        ref: "TrainClass",
        required: true,
      },
    ],
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

// Create compound index for unique route
routeSchema.index({ fromStation: 1, toStation: 1 }, { unique: true });
routeSchema.index({ isActive: 1 });
routeSchema.index({ routeName: "text" });

// Pre-save middleware to prevent same station routes
routeSchema.pre("save", function (next) {
  if (this.fromStation.toString() === this.toStation.toString()) {
    next(new Error("From station and to station cannot be the same"));
  }
  next();
});

// Pre-save middleware to generate route code if not provided
routeSchema.pre("save", function (next) {
  if (!this.routeCode) {
    this.routeCode = `R${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
  }
  next();
});

// Virtual for populated fields
routeSchema.virtual("fromStationDetails", {
  ref: "Station",
  localField: "fromStation",
  foreignField: "_id",
  justOne: true,
});

routeSchema.virtual("toStationDetails", {
  ref: "Station",
  localField: "toStation",
  foreignField: "_id",
  justOne: true,
});

export const Route =
  mongoose.models.Route || mongoose.model<RouteDocument>("Route", routeSchema);

// Zod schema for Route validation
export const RouteZodSchema = z.object({
  routeName: z.string().min(1),
  routeCode: z.string().min(1).max(20),
  fromStation: z.string().min(1), // Should be ObjectId as string
  toStation: z.string().min(1), // Should be ObjectId as string
  distance: z.number().min(1),
  baseFare: z.number().min(0),
  estimatedDuration: z.string().regex(/^([0-9]+h\s)?[0-9]+m$/),
  availableClasses: z.array(z.string().min(1)), // ObjectId as string
  isActive: z.boolean(),
});
