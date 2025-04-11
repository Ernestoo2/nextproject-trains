export interface LoginFormData {
  email: string;
  password: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateLoginForm(data: LoginFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.email) {
    errors.push({ field: "email", message: "Email is required" });
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.push({ field: "email", message: "Email is invalid" });
  }

  if (!data.password) {
    errors.push({ field: "password", message: "Password is required" });
  } else if (data.password.length < 6) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters",
    });
  }

  return errors;
}
