import mongoose from "mongoose";

const TrainSchema = new mongoose.Schema(
  {
    trainName: {
      type: String,
      required: [true, "Train name is required"],
    },
    runsOn: {
      type: String,
      required: [true, "Running days are required"],
    },
    startDate: {
      type: String,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: String,
      required: [true, "End date is required"],
    },
    departureTime: {
      type: String,
      required: [true, "Departure time is required"],
    },
    arrivalTime: {
      type: String,
      required: [true, "Arrival time is required"],
    },
    departureStation: {
      type: String,
      required: [true, "Departure station is required"],
    },
    arrivalStation: {
      type: String,
      required: [true, "Arrival station is required"],
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
    },
    baseFare: {
      type: Number,
      required: [true, "Base fare is required"],
    },
    tatkalCharges: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Train = mongoose.models.Train || mongoose.model("Train", TrainSchema); 