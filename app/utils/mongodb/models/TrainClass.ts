import mongoose from "mongoose";

const trainClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  baseFare: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

// Create indexes for common queries
trainClassSchema.index({ code: 1 }, { unique: true });
trainClassSchema.index({ isActive: 1 });

export const TrainClass = mongoose.models.TrainClass || mongoose.model("TrainClass", trainClassSchema);
