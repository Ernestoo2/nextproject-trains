export interface UserProfile {
  naijaRailsId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  defaultNationality: string;
  preferredBerth: string;
  lastUpdated: Date;
}

export interface UserContextType {
  userProfile: UserProfile | null;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  generateNaijaRailsId: () => string;
} 