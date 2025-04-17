export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  naijaRailsId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
};
