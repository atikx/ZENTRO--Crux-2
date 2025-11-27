import { z } from "zod";

export const createStreamSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")     
    .min(3, "Title must be at least 3 characters"),
  
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
});
