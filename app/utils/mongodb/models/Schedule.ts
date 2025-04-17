import mongoose, { Document } from "mongoose";

export interface ISchedule extends Document {
  train: mongoose.Types.ObjectId;
  route: mongoose.Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: {
    FC: number;
    BC: number;
    SC: number;
  };
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scheduleSchema = new mongoose.Schema({
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
    required: true,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: true,
  },
  departureTime: {
    type: String,
    required: true,
  },
  arrivalTime: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  availableSeats: {
    FC: { type: Number, default: 50 }, // First Class
    BC: { type: Number, default: 100 }, // Business Class
    SC: { type: Number, default: 200 }, // Standard Class
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED',
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, { timestamps: true });

// Create compound indexes for common queries
scheduleSchema.index({ train: 1, route: 1, date: 1 }, { unique: true });
scheduleSchema.index({ 'route.fromStation': 1, 'route.toStation': 1, date: 1 });
scheduleSchema.index({ departureTime: 1 });

export const Schedule = mongoose.models.Schedule || mongoose.model<ISchedule>("Schedule", scheduleSchema); 