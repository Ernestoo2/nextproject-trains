import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  train: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Train',
    required: true,
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
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
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'],
    default: 'SCHEDULED',
  },
  availableSeats: {
    FC: {
      type: Number,
      required: true,
      min: 0,
    },
    BC: {
      type: Number,
      required: true,
      min: 0,
    },
    SC: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

export const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema); 