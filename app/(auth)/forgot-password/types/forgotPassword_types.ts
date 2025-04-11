export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordProps {
  onSubmit?: (email: string) => void;
  onBack?: () => void;
}

export type ForgotPasswordResponse = {
  success: boolean;
  message: string;
};
