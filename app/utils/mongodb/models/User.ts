import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  naijaRailsId: {
    type: String,
    unique: true,
    required: true,
  },
  phone: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "user" ,
  },
  address: {
    type: String,
    default: "",
  },
  dob: {
    type: String,
    default: "",
  },
  createdAt: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: String,
    required: true,
  },
});

// Update the timestamps before saving
userSchema.pre("save", function (next) {
  if (!this.createdAt) {
    this.createdAt = new Date().toISOString();
  }
  this.updatedAt = new Date().toISOString();
  next();
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
