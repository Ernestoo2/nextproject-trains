import mongoose from "mongoose";

const trainScheduleSchema = new mongoose.Schema({
  trainId: { type: String, required: true },
  journeyDate: { type: Date, required: true },
  routes: [{
    station: {
      code: { type: String, required: true },
      name: { type: String, required: true }
    },
    arrivalTime: { type: String },
    departureTime: { type: String, required: true },
    distance: { type: Number, required: true },
    platform: { type: String, required: true }
  }],
  status: {
    type: String,
    enum: ["SCHEDULED", "DELAYED", "CANCELLED", "COMPLETED"],
    default: "SCHEDULED"
  },
  classes: [{
    code: { type: String, required: true },
    name: { type: String, required: true },
    fare: { type: Number, required: true },
    availableSeats: { type: Number, required: true }
  }]
}, { timestamps: true });

export const TrainSchedule = mongoose.models.TrainSchedule || mongoose.model("TrainSchedule", trainScheduleSchema); 