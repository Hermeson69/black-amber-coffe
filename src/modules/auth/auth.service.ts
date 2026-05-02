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
  LoginClientSchema,
  LoginResponseSchema,
} from "./auth.schema";

/**
 * AuthService - Responsible for authentication operations only
 * - User registration (account creation)
 * - User login (credential validation and token generation)
 *
 * ✅ BOUNDARIES:
 * - Focus: Authentication & Token Generation
 * - Handles: Password hashing, credential validation, JWT token creation
 * - Does NOT handle: User profile updates, password changes, account deletion
 *
 * Note: Profile management (updates, deletions) is delegated to UserService
 */
export default class authService {
  private authRepository: authRepository;
  private jwtService: JWTservice;

  constructor(authRepository: authRepository, jwtService: JWTservice) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
  }

  /**
   * Register a new user
   * Creates both client and profile records in a single atomic transaction
   *
   * @param data - Registration input (name, email, password, phone)
   * @returns Registered user response with profile
   * @throws Error if email already exists
   */
  async create(data: RegisterInput): Promise<RegisterResponse> {
    const validatedData = RegisterClientSchema.parse(data);

    // Check email uniqueness
    const existingClient = await this.authRepository.getByEmail(
      validatedData.email,
    );
    if (existingClient) {
      throw new Error("Email already in use");
    }

    // Hash password for security
    validatedData.password = await SecurityUtils.hashPassword(
      validatedData.password,
    );

    // Create model and save to database (within transaction)
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

  /**
   * Authenticate user and generate tokens
   * Validates credentials and issues JWT tokens for subsequent requests
   *
   * @param data - Login input (email, password)
   * @returns Login response with access and refresh tokens
   * @throws Error if credentials are invalid
   */
  async login(data: LoginInput): Promise<LoginResponse> {
    const validateData = LoginClientSchema.parse(data);

    // Retrieve user by email
    const client = await this.authRepository.getByEmail(validateData.email);
    if (!client) {
      throw new Error("Invalid email or password");
    }

    // Validate password
    const isPasswordValid = await SecurityUtils.comparePassword(
      validateData.password,
      client.password,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const accessToken = this.jwtService.generateToken({
      id: client.id,
      email: client.email,
      publicId: client.publicId,
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
            phone: client.phone ?? null,
            avatarImage: null,
            createdAt: client.createdAt,
          },
        },
      },
    });
  }
}
