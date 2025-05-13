export interface NaijaRailsProfile {
  _id: string;
  userId: string;
  naijaRailsId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  defaultNationality: string;
  preferredBerth: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NaijaRailsProfileResponse {
  success: boolean;
  data?: NaijaRailsProfile;
  error?: string;
}

export interface NaijaRailsProfileUpdate {
  fullName?: string;
  phoneNumber?: string;
  defaultNationality?: string;
  preferredBerth?: string;
}
