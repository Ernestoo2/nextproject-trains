import mongoose from "mongoose";

const trainClassSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const TrainClass =
  mongoose.models.TrainClass || mongoose.model("TrainClass", trainClassSchema);
