export interface SetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface PasswordValidation {
  isLengthValid: boolean;
  hasLetterAndNumber: boolean;
  passwordsMatch: boolean;
}

export interface SetPasswordProps {
  onSubmit?: (password: string) => void;
  onBack?: () => void;
}
