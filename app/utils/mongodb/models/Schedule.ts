import mongoose from "mongoose";
import type { Schedule as ISchedule } from "@/types/shared/database";
import { z } from "zod";

const scheduleSchema = new mongoose.Schema<ISchedule>(
  {
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
    departureTime: { type: String, required: true },
    arrivalTime: { type: String, required: true },
    date: { type: Date, required: true },
    availableSeats: { type: Map, of: Number, required: true },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DELAYED"],
      required: true,
    },
    platform: String,
    fare: { type: Map, of: Number, required: true },
    duration: String,
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
scheduleSchema.index({ date: 1, status: 1 });
scheduleSchema.index({ train: 1, date: 1 });
scheduleSchema.index({ route: 1, date: 1 });
scheduleSchema.index({ departureTime: 1 });



// ADD the correct compound UNIQUE index
scheduleSchema.index({ train: 1, route: 1, date: 1, departureTime: 1 }, { unique: true });

// Virtual for duration calculation
scheduleSchema.virtual("calculatedDuration").get(function () {
  const [depHours, depMinutes] = this.departureTime.split(":").map(Number);
  const [arrHours, arrMinutes] = this.arrivalTime.split(":").map(Number);

  let hoursDiff = arrHours - depHours;
  let minutesDiff = arrMinutes - depMinutes;

  if (minutesDiff < 0) {
    hoursDiff--;
    minutesDiff += 60;
  }
  if (hoursDiff < 0) {
    hoursDiff += 24;
  }

  return `${hoursDiff}h ${minutesDiff}m`;
});

export const Schedule =
  mongoose.models.Schedule ||
  mongoose.model<ISchedule>("Schedule", scheduleSchema);

// Zod schema for Schedule validation
export const ScheduleZodSchema = z.object({
  train: z.string().min(1), // ObjectId as string
  route: z.string().min(1), // ObjectId as string
  departureTime: z.string().regex(/^\d{2}:\d{2}$/),
  arrivalTime: z.string().regex(/^\d{2}:\d{2}$/),
  date: z.coerce.date(),
  availableSeats: z.record(z.string(), z.number().min(0)),
  status: z.enum([
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
    "DELAYED",
  ]),
  platform: z.string().optional(),
  fare: z.record(z.string(), z.number().min(0)),
  duration: z.string().optional(),
  isActive: z.boolean().optional(),
});
