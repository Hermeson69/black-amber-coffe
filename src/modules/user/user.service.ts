import SecurityUtils from "@/core/security";
import authRepository from "@/modules/auth/auth.repository";
import UserRepository from "@/modules/user/user.repository";
import UserModel from "@/modules/user/user.model";
import {
  UserUpdateInput,
  UserResponse,
  UserResponseSchema,
  UserUpdateInputSchema,
} from "./user.schema";

export default class UserService {
  private authRepository: authRepository;
  private userRepository: UserRepository;

  constructor(authRepository: authRepository, userRepository: UserRepository) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
  }

  async get(publicId: string): Promise<UserResponse> {
    const user = await this.userRepository.getByPublicId(publicId);
    if (!user) {
      throw new Error("User not found");
    }

    return UserResponseSchema.parse({
      publicId: user.publicId,
      name: user.profile.fullName,
      email: user.email,
      profile: {
        fullName: user.profile.fullName,
        phone: user.profile.phone,
        avatarImage: user.profile.avatarImage,
        createdAt: user.profile.createdAt,
        updatedAt: user.profile.updatedAt,
      },
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }

  async updateClient(
    publicId: string,
    data: UserUpdateInput,
  ): Promise<UserResponse> {
    const validatedData = UserUpdateInputSchema.parse(data);

    const user = await this.userRepository.getByPublicId(publicId);
    if (!user) {
      throw new Error("User not found");
    }

    let password = undefined;
    if (validatedData.password) {
      password = await SecurityUtils.hashPassword(validatedData.password);
    }

    const updatedUser = new UserModel(
      user.id,
      user.publicId,
      validatedData.email ?? user.email,
      user.createdAt,
      new Date().toISOString(),
      {
        fullName: validatedData.name ?? user.profile.fullName,
        phone: validatedData.phone ?? user.profile.phone,
        avatarImage: user.profile.avatarImage,
        createdAt: user.profile.createdAt,
        updatedAt: new Date().toISOString(),
      },
    );

    const result = await this.userRepository.update(updatedUser, password);

    return UserResponseSchema.parse({
      publicId: result.publicId,
      name: result.profile.fullName,
      email: result.email,
      profile: {
        fullName: result.profile.fullName,
        phone: result.profile.phone,
        avatarImage: result.profile.avatarImage,
        createdAt: result.profile.createdAt,
        updatedAt: result.profile.updatedAt,
      },
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  }

  async deleteClient(publicId: string): Promise<void> {
    const user = await this.userRepository.getByPublicId(publicId);
    if (!user) {
      throw new Error("User not found");
    }
    await this.userRepository.deleteByPublicId(publicId);
  }
}
