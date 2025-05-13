import { ValidationError } from "./api.types";

//app/types/shared/validation.types.ts

interface ValidationRule<T = any> {
  validate: (value: T) => boolean;
  message: string;
}

interface FieldValidation {
  field: string;
  rules: ValidationRule[];
  isRequired?: boolean;
}

interface ValidationSchema {
  [field: string]: FieldValidation;
}

interface ValidatorOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
}

interface ValidationContext {
 path: string[];
  value: any;
  parent?: any;
  root?: any;
}

interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  value?: any;
}

type Validator<T = any> = (
  data: T,
  options?: ValidatorOptions
) => ValidationResult;

type ValidationFunction<T = any> = (
  value: T,
  context?: ValidationContext
) => boolean | Promise<boolean>;

// Common validation rules
const ValidationRules = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value: any) => value !== undefined && value !== null && value !== '',
    message
  }),

  min: (min: number, message = `Value must be at least ${min}`): ValidationRule => ({
    validate: (value: number) => value >= min,
    message
  }),

  max: (max: number, message = `Value must be at most ${max}`): ValidationRule => ({
    validate: (value: number) => value <= max,
    message
  }),

  minLength: (min: number, message = `Must be at least ${min} characters`): ValidationRule => ({
    validate: (value: string | any[]) => value.length >= min,
    message
  }),

  maxLength: (max: number, message = `Must be at most ${max} characters`): ValidationRule => ({
    validate: (value: string | any[]) => value.length <= max,
    message
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value: string) => regex.test(value),
    message
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message
  }),

  phone: (message = 'Invalid phone number'): ValidationRule => ({
    validate: (value: string) => /^\+?[\d\s-]{10,}$/.test(value),
    message
  })
};