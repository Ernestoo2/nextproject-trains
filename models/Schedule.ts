import mongoose, { Schema } from "mongoose";
import { ScheduleDocument } from "@/types/schedule.types";

const scheduleSchema = new Schema<ScheduleDocument>(
  {
    train: {
      type: Schema.Types.ObjectId,
      ref: "Train",
      required: true,
    },
    route: {
      type: Schema.Types.ObjectId,
      ref: "Route",
      required: true,
    },
    departureStation: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    arrivalStation: {
      type: Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: "Time must be in HH:mm format",
      },
    },
    arrivalTime: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: "Time must be in HH:mm format",
      },
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    availableClasses: [{
      class: String,
      availableSeats: Number,
      fare: Number,
      name: String,
      code: String,
      baseFare: Number
    }],
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED',
      required: true,
    },
    platform: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
scheduleSchema.index({ date: 1, status: 1 });
scheduleSchema.index({ train: 1, date: 1 });
scheduleSchema.index({ route: 1, date: 1 });
scheduleSchema.index({ departureStation: 1, arrivalStation: 1, date: 1 });

// Virtual for duration
scheduleSchema.virtual("duration").get(function() {
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

export const Schedule = mongoose.models.Schedule ||
  mongoose.model<ScheduleDocument>("Schedule", scheduleSchema);