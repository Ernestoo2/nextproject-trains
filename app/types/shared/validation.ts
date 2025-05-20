import { addDays } from "date-fns";
import { z } from "zod";
import { ValidationError } from "./api";
import { ValidationOptions, ValidationRule } from "./errorHandling"; 

//app/types/shared/validation.ts

export interface ValidationContext {
  path: string[];
  value: any;
  parent?: any;
  root?: any;
}

export interface ValidationSchema {
  [field: string]: {
    rules: ValidationRule[];
    isRequired?: boolean;
    transform?: (value: any) => any;
    children?: ValidationSchema;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  transformedData?: any;
}

export interface CustomValidationRule extends ValidationRule {
  context?: ValidationContext;
  options?: ValidationOptions;
}

// Common validation rules
export const CommonValidationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value: any) =>
      value !== undefined && value !== null && value !== "",
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string | any[]) => !value || value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string | any[]) => !value || value.length <= max,
    message: message || `Must be at most ${max} characters`,
  }),

  pattern: (regex: RegExp, message = "Invalid format"): ValidationRule => ({
    validate: (value: string) => !value || regex.test(value),
    message,
  }),

  email: (message = "Invalid email address"): ValidationRule => ({
    validate: (value: string) =>
      !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  phone: (message = "Invalid phone number"): ValidationRule => ({
    validate: (value: string) => !value || /^\+?[\d\s-]{10,}$/.test(value),
    message,
  }),

  date: (message = "Invalid date"): ValidationRule => ({
    validate: (value: string) => !value || !isNaN(Date.parse(value)),
    message,
  }),

  future: (message = "Date must be in the future"): ValidationRule => ({
    validate: (value: string) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date();
    },
    message,
  }),

  numeric: (message = "Must be a number"): ValidationRule => ({
    validate: (value: any) => !value || !isNaN(Number(value)),
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value: number) => !value || value >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value: number) => !value || value <= max,
    message: message || `Must be at most ${max}`,
  }),

  enum: (values: any[], message?: string): ValidationRule => ({
    validate: (value: any) => !value || values.includes(value),
    message: message || `Must be one of: ${values.join(", ")}`,
  }),

  objectId: (message = "Invalid ID format"): ValidationRule => ({
    validate: (value: string) => !value || /^[0-9a-fA-F]{24}$/.test(value),
    message,
  }),
};

export interface ValidatorConfig {
  schema: ValidationSchema;
  options?: ValidationOptions;
  customRules?: Record<string, ValidationRule>;
}

export type Validator = (
  data: any,
  config: ValidatorConfig
) => ValidationResult;

// Base schemas
export const StationSchema = z
  .object({
    id: z.string().optional(),
    _id: z.string().optional(),
    name: z.string(),
    code: z.string(),
    city: z.string(),
    state: z.string(),
    isActive: z.boolean(),
  })
  .refine((data) => data.id || data._id, {
    message: "Station must have either id or _id",
  });

export const PassengerDetailsSchema = z
  .object({
    classType: z.string().min(1),
    adultCount: z.number().int().min(1),
    childCount: z.number().int().min(0),
    infantCount: z.number().int().min(0),
  })
  .refine((data) => data.infantCount <= data.adultCount, {
    message: "Number of infants cannot exceed number of adults",
  });

export const TrainClassSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  baseFare: z.number().min(0),
  isActive: z.boolean(),
  availableSeats: z.number().optional(),
});

// Selector Props Schemas
export const FromToSelectorPropsSchema = z.object({
  stations: z.array(StationSchema),
  selectedFrom: z.string().nullable(),
  selectedTo: z.string().nullable(),
  onFromChange: z.function().args(z.string()).returns(z.void()),
  onToChange: z.function().args(z.string()).returns(z.void()),
  date: z.string().optional(),
  classType: z.string().optional(),
});

export const PassengerClassSelectorPropsSchema = z.object({
  availableClasses: z.array(TrainClassSchema),
  selectedClass: z.string().min(1, "Class selection is required"),
  passengerCounts: PassengerDetailsSchema,
  onClassSelect: z.function().args(z.string()).returns(z.void()),
  onPassengerCountChange: z
    .function()
    .args(
      z.object({
        adultCount: z.number().int().min(1, "At least one adult is required"),
        childCount: z.number().int().min(0),
        infantCount: z.number().int().min(0),
      })
    )
    .returns(z.void()),
  maxPassengersPerBooking: z
    .number()
    .int()
    .min(1, "Maximum passengers per booking must be at least 1")
    .optional(),
});

export const TripSelectorPropsSchema = z.object({
  value: z.enum(["ONE_WAY", "ROUND_TRIP"] as const),
  onChange: z
    .function()
    .args(z.enum(["ONE_WAY", "ROUND_TRIP"] as const))
    .returns(z.void()),
});

export const DateSelectorPropsSchema = z.object({
  onDatesChange: z.function().args(z.string()).returns(z.void()),
  defaultDate: z
    .string()
    .optional()
    .refine(
      (date) => {
        if (!date) return true;
        const dateObj = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const maxDate = addDays(today, 21);
        maxDate.setHours(23, 59, 59, 999); // Set to end of day

        // Check if it's a valid date first
        if (isNaN(dateObj.getTime())) return false;

        return dateObj >= today && dateObj <= maxDate;
      },
      {
        message: "Date must be between today and 21 days from now",
      }
    ),
});

// Validation helper functions
export function validateProps<T>(schema: z.ZodSchema<T>, props: T): void {
  try {
    schema.parse(props);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      throw new Error(
        `Props validation failed: ${error.errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }
    throw error;
  }
}
