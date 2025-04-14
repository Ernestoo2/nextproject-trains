import mongoose from "mongoose";

const trainSchema = new mongoose.Schema({
  trainName: { type: String, required: true },
  trainNumber: { type: String, required: true, unique: true },
  routes: [
    {
      station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: true,
      },
      arrivalTime: { type: String, required: true },
      departureTime: { type: String, required: true },
      day: { type: Number, required: true },
    },
  ],
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: "TrainClass" }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Train =
  mongoose.models.Train || mongoose.model("Train", trainSchema);
