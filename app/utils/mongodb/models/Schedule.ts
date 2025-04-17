import mongoose, { Document } from "mongoose";

export interface ISchedule extends Document {
  train: mongoose.Types.ObjectId;
  route: mongoose.Types.ObjectId;
  departureTime: string;
  arrivalTime: string;
  date: Date;
  availableSeats: Record<string, number>;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  duration?: string;
  platform?: string;
  fare?: Record<string, number>;
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
    validate: {
      validator: function(v: string) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: "Time must be in HH:mm format"
    }
  },
  arrivalTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
      },
      message: "Time must be in HH:mm format"
    }
  },
  date: {
    type: Date,
    required: true,
    index: true,
  },
  availableSeats: {
    type: Map,
    of: Number,
    default: {},
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
  platform: {
    type: String,
    default: null,
  },
  fare: {
    type: Map,
    of: Number,
    default: {},
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for duration
scheduleSchema.virtual('duration').get(function() {
  const [depHours, depMinutes] = this.departureTime.split(':').map(Number);
  const [arrHours, arrMinutes] = this.arrivalTime.split(':').map(Number);
  
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

// Create compound indexes for common queries
scheduleSchema.index({ train: 1, route: 1, date: 1 }, { unique: true });
scheduleSchema.index({ route: 1, date: 1 });
scheduleSchema.index({ departureTime: 1 });
scheduleSchema.index({ status: 1, isActive: 1 });

// Add a pre-save middleware to ensure date is properly formatted
scheduleSchema.pre('save', function(next) {
  if (this.date instanceof Date) {
    this.date.setHours(0, 0, 0, 0); // Set time to midnight for consistent dates
  }
  next();
});

export const Schedule = mongoose.models.Schedule || mongoose.model<ISchedule>("Schedule", scheduleSchema); 