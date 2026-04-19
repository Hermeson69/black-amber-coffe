import * as z from "zod";

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


export const ProfileResponseSchema = z.object({
  fullName: z.string(),
  avatarImage: z.string().nullable(),
  createdAt: z.string(),
});

export const RegisterResponseSchema = z.object({
  data: z.object({
    publicId: z.string(),
    email: z.email(),
    createdAt: z.string(),
    updatedAt: z.string(),
    name: z.string(),
    profile: ProfileResponseSchema,
  }),
});

export const LoginResponseSchema = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    user: z.object({
      publicId: z.string(),
      email: z.email(),
      profile: ProfileResponseSchema,
    }),
  }),
});


export type RegisterInput = z.infer<typeof RegisterClientSchema>;
export type ProfileResponse = z.infer<typeof ProfileResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type LoginInput = z.infer<typeof LoginClientSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
