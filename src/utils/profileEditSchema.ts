import { z } from "zod";

export const profileEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  userName: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  address: z.object({
    city: z.string().optional(),
    street: z.string().optional(),
    building: z.number().optional(),
  }).optional(),
});
