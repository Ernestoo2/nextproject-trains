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

// Create indexes for common queries
routeSchema.index({ fromStation: 1, toStation: 1 }, { unique: true });
routeSchema.index({ isActive: 1 });
routeSchema.index({ 'fromStation': 1 });
routeSchema.index({ 'toStation': 1 });

// Add a pre-save middleware to ensure stations are different
routeSchema.pre('save', function(next) {
  if (this.fromStation.equals(this.toStation)) {
    next(new Error('From station and to station cannot be the same'));
  }
  next();
});

export const Route = mongoose.models.Route || mongoose.model("Route", routeSchema); 