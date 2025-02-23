import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters").regex(/^[A-Za-z\s]+$/, "Only English letters allowed"),
  userName: z.string().min(3, "Must be at least 3 characters").regex(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(5, "Must be at least 5 characters"),
  confirmPassword: z.string(),
  address: z.object({
    city: z.string().min(1, "City is required").regex(/^[A-Za-z\u0590-\u05FF\s]+$/, "Only letters allowed"),
    street: z.string().min(1, "Street is required").regex(/^[A-Za-z\u0590-\u05FF\s]+$/, "Only letters allowed"),
    building: z.number().min(1, "Building must be a number greater than 0"),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
