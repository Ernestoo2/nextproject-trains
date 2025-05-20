import mongoose, { Document } from "mongoose";
import { 
  UserDocument,
} from "@/types/shared/users";

const userSchema = new mongoose.Schema(
  {
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
      select: false,
    },
    naijaRailsId: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      default: "USER",
    },
    address: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Only create index for role since email and naijaRailsId already have unique constraints
userSchema.index({ role: 1 });

// Export the model
export const User =
  mongoose.models.User ||
  mongoose.model<UserDocument & Document>("User", userSchema);
