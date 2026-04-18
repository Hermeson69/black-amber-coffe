import * as z from "zod";
import { Clients } from "../../db/schema";

export const RegisterClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  phone: z.string().min(1, "Phone number is required").optional(),
});

export const LoginClientSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const SignupSchema = RegisterClientSchema;

export const ClentResponseSchema = z.object({
  publicId: z.string(),
  name: z.string(),
  email: z.email(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastLogin: z.string(),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  client: ClentResponseSchema,
});

export type RegisterInput = z.infer<typeof RegisterClientSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginClientSchema>;
export type ClientResponse = z.infer<typeof ClentResponseSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
