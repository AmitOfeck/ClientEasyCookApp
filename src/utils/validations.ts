import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters").regex(/^[A-Za-z\s]+$/, "Only English letters allowed"),
  userName: z.string().min(3, "Must be at least 3 characters").regex(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(5, "Must be at least 5 characters"),
  confirmPassword: z.string(),
  address: z.object({
    city: z.string()
      .regex(/^[A-Za-z\u0590-\u05FF\s]*$/, "Only letters allowed") // Allow empty string
      .optional(),
    street: z.string()
      .regex(/^[A-Za-z\u0590-\u05FF\s]*$/, "Only letters allowed") // Allow empty string
      .optional(),
    building: z.preprocess((val) => val === "" || val === undefined ? undefined : Number(val), 
      z.number().min(1, "Building must be a number greater than 0").optional()
    ),
  }).superRefine((data, ctx) => {
    const filledFields = Object.values(data).filter(Boolean).length;
    if (filledFields > 0 && filledFields < Object.keys(data).length) {
      if (!data.city) ctx.addIssue({ path: ["city"], message: "City is required if other address fields are filled", code: "custom" });
      if (!data.street) ctx.addIssue({ path: ["street"], message: "Street is required if other address fields are filled", code: "custom" });
      if (!data.building) ctx.addIssue({ path: ["building"], message: "Building is required if other address fields are filled", code: "custom" });
    }
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});