import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  fromStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  toStation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Station",
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  baseFare: {
    type: Number,
    required: true,
  },
  estimatedDuration: {
    type: String,
    required: true,
  },
  availableClasses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TrainClass",
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export const Route = mongoose.models.Route || mongoose.model("Route", routeSchema); 