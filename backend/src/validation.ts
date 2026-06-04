import { z } from "zod";

export const RegisterInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  mobile: z
    .string()
    .regex(/^04\d{8}$/, "Mobile must be a valid Australian number (04XXXXXXXX)"),
  postcode: z.string().regex(/^\d{4}$/, "Postcode must be 4 digits"),
  services: z
    .array(z.string().min(1))
    .min(1, "At least one service must be selected"),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
