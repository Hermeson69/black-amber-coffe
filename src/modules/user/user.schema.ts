import * as z from "zod";

// User Profile Response
export const UserProfileSchema = z.object({
  fullName: z.string(),
  phone: z.string().nullable(),
  avatarImage: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// User Response - dados do usuário
export const UserResponseSchema = z.object({
  publicId: z.string(),
  name: z.string(),
  email: z.email(),
  profile: UserProfileSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

// User Update Input - apenas campos atualizáveis
export const UserUpdateInputSchema = z
  .object({
    name: z.string().min(1, "Name must not be empty").optional(),
    email: z.email("Invalid email address").optional(),
    phone: z.string().min(1, "Phone must not be empty").optional(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update",
  );

// Get User Response - wrapper com data
export const GetUserResponseSchema = z.object({
  data: UserResponseSchema,
});

// Update User Response - wrapper com data
export const UpdateUserResponseSchema = z.object({
  data: UserResponseSchema,
  message: z.string().optional(),
});

// Types
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateInputSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
