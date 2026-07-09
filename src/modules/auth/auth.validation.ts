import { z } from "zod";


const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters long.")
  .max(100, "Password cannot exceed 100 characters.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,100}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
  );

const emailSchema =z
    .email("Invalid email address")
    .trim()
    .toLowerCase(); 

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

  email: emailSchema,

  password: passwordSchema

}).strict();


export const loginSchema = z.object({
  email:emailSchema,
  password:z.string().min(8,"Password must be at least 8 characters")
}).strict();

export const resendVerificationSchema = z.object({
  email: emailSchema,
}).strict();

export const resetPasswordSchema = z.object({
    token: z.string().trim().min(1),
    password: passwordSchema,
}).strict();

export const forgotPasswordSchema = z.object({
    email: emailSchema,
}).strict();

export const changePasswordSchema = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  }).strict();

export type RegisterUserInput =
  z.infer<typeof registerSchema>;

export type LoginUserInput = 
  z.infer<typeof loginSchema>;