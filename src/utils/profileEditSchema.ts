import { z } from "zod";

export const profileEditSchema = z.object({
  name: z.string().min(3, "Must be at least 3 characters").regex(/^[A-Za-z\u0590-\u05FF\s]+$/, "Only English or Hebrew letters allowed"),
  userName: z.string().min(3, "Must be at least 3 characters").regex(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed"),
  email: z.string().email("Invalid email format"),
  address: z.object({
    city: z.string()
      .regex(/^[A-Za-z\u0590-\u05FF\s]*$/, "Only letters allowed") // Allow empty string
      .optional(),
    street: z.string()
      .regex(/^[A-Za-z\u0590-\u05FF\s]*$/, "Only letters allowed") // Allow empty string
      .optional(),
    building: z.string()
      .regex(/^\d*$/, "Only numbers allowed")
      .refine((val) => !/^0+$/.test(val), "Building number cannot be zero") 
      .optional()
  }).superRefine((data, ctx) => {
    const filledFields = Object.values(data).filter(Boolean).length;
    if (filledFields > 0 && filledFields < Object.keys(data).length) {
      if (!data.city) ctx.addIssue({ path: ["city"], message: "City is required if other address fields are filled", code: "custom" });
      if (!data.street) ctx.addIssue({ path: ["street"], message: "Street is required if other address fields are filled", code: "custom" });
      if (!data.building) ctx.addIssue({ path: ["building"], message: "Building is required if other address fields are filled", code: "custom" });
    }
  }),
});
