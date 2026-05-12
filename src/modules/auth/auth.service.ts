import JWTservice from "@/core/jwt.service";
import authModel from "@/modules/auth/auth.model";
import authRepository from "@/modules/auth/auth.repository";
import SecurityUtils from "@/core/security";

import {
  RegisterInput,
  RegisterClientSchema,
  RegisterResponse,
  RegisterResponseSchema,
  LoginInput,
  LoginResponse,
  LoginResponseSchema,
} from "./auth.schema";

export default class authService {
  private authRepository: authRepository;
  private jwtService: JWTservice;

  constructor(authRepository: authRepository, jwtService: JWTservice) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
  }

  async create(data: RegisterInput): Promise<RegisterResponse> {
    const validatedData = RegisterClientSchema.parse(data);

    const existingClient = await this.authRepository.getByEmail(
      validatedData.email,
    );
    if (existingClient) {
      throw new Error("Email already in use");
    }

    validatedData.password = await SecurityUtils.hashPassword(
      validatedData.password,
    );

    const model = authModel.fromCreateData(validatedData);
    const createdClient = await this.authRepository.create(model);

    return RegisterResponseSchema.parse({
      data: {
        publicId: createdClient.publicId,
        email: createdClient.email,
        createdAt: createdClient.createdAt,
        updatedAt: createdClient.updatedAt,
        profile: {
          fullName: createdClient.name,
          phone: createdClient.phone ?? null,
          avatarImage: null,
          createdAt: createdClient.createdAt,
        },
      },
    });
  }

  async login(data: LoginInput): Promise<LoginResponse> {
    const validateData = {
      email: data.email,
      password: data.password,
    };

    const authEntity = await this.authRepository.getByEmail(validateData.email);
    if (!authEntity) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await SecurityUtils.comparePassword(
      validateData.password,
      authEntity.user.password,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = this.jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
    });

    const refreshToken = this.jwtService.generateRefreshToken(authEntity.user.publicId);

    return LoginResponseSchema.parse({
      data: {
        accessToken,
        refreshToken,
        user: {
          publicId: authEntity.user.publicId,
          email: authEntity.user.email,
          userType: authEntity.type,
          profile: {
            fullName: authEntity.user.name,
            phone: authEntity.user.phone ?? null,
            avatarImage: null,
            createdAt: authEntity.user.createdAt,
          },
        },
      },
    });
  }
}
