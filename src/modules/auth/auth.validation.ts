import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(
      /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
      "Please enter a valid name"
    ),

  email: z
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character"
    ),
}).strict();

export const loginSchema = z.object({
  email:z.email("invalid email address").trim().toLowerCase(),
  password:z.string().min(8,"Password must be at least 8 characters")
})

export const resendVerificationSchema = z.object({
  email: z.email("Please provide a valid email address."),
});

export type RegisterUserInput =
  z.infer<typeof registerSchema>;

export type LoginUserInput = 
  z.infer<typeof loginSchema>;