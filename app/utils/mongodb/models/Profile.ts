import mongoose from "mongoose";
import { NaijaRailsProfile } from "@/types/shared/users";

export interface ProfileDocument extends NaijaRailsProfile, mongoose.Document {
  createdAt: string;
  updatedAt: string;
}

const profileSchema = new mongoose.Schema<ProfileDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    naijaRailsId: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    nationality: {
      type: String,
      required: true,
    },
    defaultNationality: {
      type: String,
      required: true,
    },
    preferredBerth: {
      type: String,
      enum: ["lower", "middle", "upper", "side"],
      required: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Profile =
  mongoose.models.Profile ||
  mongoose.model<ProfileDocument>("Profile", profileSchema);
