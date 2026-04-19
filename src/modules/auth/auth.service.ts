import JWTservice from "../../core/jwt.service";
import authModel from "./auth.model";
import authRepository from "./auth.repository";
import SecurityUtils from "../../core/security";

import {
  RegisterInput,
  RegisterClientSchema,
  RegisterResponse,
  RegisterResponseSchema,
  LoginInput,
  LoginResponse,
  LoginClientSchema,
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
        name: createdClient.name,
        profile: {
          fullName: createdClient.name,
          avatarImage: null,
          createdAt: createdClient.createdAt,
        },
      },
    });
  }

  async login(data: LoginInput): Promise<LoginResponse> {
    const validateData = LoginClientSchema.parse(data);
    const client = await this.authRepository.getByEmail(validateData.email);

    if (!client) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await SecurityUtils.comparePassword(
      validateData.password,
      client.password,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = this.jwtService.generateToken({
      id: client.id,
      email: client.email,
    });

    const refreshToken = this.jwtService.generateRefreshToken(client.publicId);

    return LoginResponseSchema.parse({
      data: {
        accessToken,
        refreshToken,
        user: {
          publicId: client.publicId,
          email: client.email,
          profile: {
            fullName: client.name,
            avatarImage: null,
            createdAt: client.createdAt,
          },
        },
      },
    });
  }
}
