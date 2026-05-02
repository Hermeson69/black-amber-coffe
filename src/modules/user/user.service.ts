import SecurityUtils from "@/core/security";
import authRepository from "@/modules/auth/auth.repository";
import userRepository from "@/modules/user/user.repository";
import authModel from "@/modules/auth/auth.model";
import {
  UserUpdateInput,
  UserResponse,
  UserResponseSchema,
  UserUpdateInputSchema,
} from "./user.schema";

/**
 * UserService - Responsible for user profile management only
 * - Retrieve user information (including profile data)
 * - Update user profile (name, email, password, phone)
 * - Delete user account and all related data
 *
 * ✅ BOUNDARIES:
 * - Focus: User Profile Management & Account Operations
 * - Handles: Profile retrieval, updates, deletion
 * - Uses own schemas (UserSchema) - independent from auth.schema
 * - Does NOT handle: Authentication, token generation, login/registration
 *
 * Note: Authentication logic is delegated to AuthService
 */
export default class userService {
  private authRepository: authRepository;
  private userRepository: userRepository;

  constructor(authRepository: authRepository, userRepository: userRepository) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
  }

  /**
   * Get user details by publicId
   * @param publicId - User's public identifier
   * @returns User response with profile data
   */
  async get(publicId: string): Promise<UserResponse> {
    const client = await this.authRepository.getById(publicId);
    if (!client) {
      throw new Error("User not found");
    }

    return UserResponseSchema.parse({
      publicId: client.publicId,
      name: client.name,
      email: client.email,
      profile: {
        fullName: client.name,
        phone: client.phone ?? null,
        avatarImage: null,
        createdAt: client.createdAt,
        updatedAt: client.createdAt,
      },
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    });
  }

  /**
   * Update user information
   * Validates all input and applies updates atomically across client and profile tables
   *
   * @param publicId - User's public identifier
   * @param data - Fields to update (name, email, password, phone)
   * @returns Updated user response
   * @throws Error if user not found or validation fails
   */
  async updateClient(
    publicId: string,
    data: UserUpdateInput,
  ): Promise<UserResponse> {
    // Validate input using user schema
    const validatedData = UserUpdateInputSchema.parse(data);

    // Fetch current user
    const client = await this.authRepository.getById(publicId);
    if (!client) {
      throw new Error("User not found");
    }

    // Hash password if provided
    let password = client.password;
    if (validatedData.password) {
      password = await SecurityUtils.hashPassword(validatedData.password);
    }

    // Prepare updated data
    const updatedClient = new authModel(
      client.id,
      client.publicId,
      validatedData.name ?? client.name,
      validatedData.email ?? client.email,
      password,
      validatedData.phone ?? client.phone,
      client.createdAt,
      new Date().toISOString(),
    );

    // Update in database (within transaction)
    const result = await this.userRepository.update(updatedClient);

    return UserResponseSchema.parse({
      publicId: result.publicId,
      name: result.name,
      email: result.email,
      profile: {
        fullName: result.name,
        phone: result.phone ?? null,
        avatarImage: null,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  /**
   * Delete user and all related data
   * Cascades deletion: profile first, then client
   *
   * @param publicId - User's public identifier
   * @throws Error if user not found
   */
  async deleteClient(publicId: string): Promise<void> {
    const client = await this.authRepository.getById(publicId);
    if (!client) {
      throw new Error("User not found");
    }
    await this.userRepository.deleteByPublicId(publicId);
  }
}
