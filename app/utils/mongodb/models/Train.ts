import mongoose from "mongoose";

const trainSchema = new mongoose.Schema({
  trainName: { type: String, required: true },
  trainNumber: { type: String, required: true, unique: true },
  routes: [
    {
      route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        required: true,
      },
      arrivalTime: { type: String, required: true },
      departureTime: { type: String, required: true },
    },
  ],
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrainClass" }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Create indexes for common queries
trainSchema.index({ trainNumber: 1 }, { unique: true });
trainSchema.index({ isActive: 1 });
trainSchema.index({ 'routes.route': 1 });

export const Train =
  mongoose.models.Train || mongoose.model("Train", trainSchema);
