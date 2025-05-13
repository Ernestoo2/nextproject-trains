import mongoose, { Document, Schema } from "mongoose";

// Define the document interface
export interface TrainDocument extends Document {
  trainName: string;
  trainNumber: string;
  classes: Schema.Types.ObjectId[];
  routes: TrainRouteDocument[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainRouteDocument {
  route: Schema.Types.ObjectId;
  arrivalTime: string;
  departureTime: string;
  day: number;
}

const trainRouteSchema = new Schema(
  {
    route: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    day: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const trainSchema = new Schema<TrainDocument>(
  {
    trainName: {
      type: String,
      required: true,
    },
    trainNumber: {
      type: String,
      required: true,
      unique: true,
    },
    classes: [
      {
        type: Schema.Types.ObjectId,
        ref: "TrainClass",
        required: true,
      },
    ],
    routes: [trainRouteSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create indexes
trainSchema.index({ isActive: 1 });
trainSchema.index({ trainName: "text" });

export const Train =
  mongoose.models.Train || mongoose.model<TrainDocument>("Train", trainSchema);
