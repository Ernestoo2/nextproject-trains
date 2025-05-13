import { z } from "zod";
import type { TrainClassType } from "./base.types";

// Validation Types
export const TrainClassZodSchema = z.object({
  className: z.string().min(3).max(50),
  classCode: z.string().min(2).max(10),
  classType: z.enum([
    "FIRST_CLASS",
    "BUSINESS",
    "ECONOMY",
    "SLEEPER",
    "STANDARD",
  ]),
  basePrice: z.number().min(0),
  capacity: z.number().min(1).max(1000).optional(),
  amenities: z.array(z.string()).optional(),
  description: z.string().min(10).max(500).optional(),
  isActive: z.boolean().default(true),
}); 