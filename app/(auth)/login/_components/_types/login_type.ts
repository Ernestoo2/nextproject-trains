export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}
export interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface LoginProps {
  onSubmit?: (data: LoginFormData) => void;
  onForgotPassword?: () => void;
  onSignUp?: () => void;
}

export type LoginResponse = {
  success: boolean;
  token?: string;
  message: string;
};

export type SocialLoginProvider = "google" | "facebook" | "apple";

export interface PaymentMethod {
  id: number;
  name: string;
  icon: string; // Only supports image URLs for consistency
  description: string;
  isSelected: boolean;
}

// Payment Props Interface
export interface PaymentProps {
  methods: PaymentMethod[];
  onMethodSelect: (id: number) => void;
}

// Ticket Interface
export interface Ticket {
  id: number;
  departure: string;
  arrival: string;
  time: string;
  date: string;
  gate: string;
  seat: string;
  airlineLogo: string; // URL for imported image paths
}

export type User = {
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
};
export type METHODSTS = {
  id: number;
  name: string;
  icon: string;
  description: string;
  isSelected: boolean;
};
