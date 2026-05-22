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
  RefreshTokenInput,
  RefreshTokenResponse,
  RefreshTokenResponseSchema,
  LogoutInput,
  LogoutResponse,
  LogoutResponseSchema,
  SendPasswordResetInput,
  SendPasswordResetResponse,
  SendPasswordResetResponseSchema,
  CheckPasswordResetInput,
  CheckPasswordResetResponse,
  CheckPasswordResetResponseSchema,
  ResetPasswordInput,
  ResetPasswordResponse,
  ResetPasswordResponseSchema,
  RefreshtokenSchema,
  LogoutSchema,
  SendPasswordResetSchema,
  CheckPasswordResetSchema,
  ResetPasswordSchema,
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
      throw new Error("EMAIL_ALREADY_IN_USE");
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
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await SecurityUtils.comparePassword(
      validateData.password,
      authEntity.user.password,
    );
    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const accessToken = this.jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
    });

    const refreshToken = this.jwtService.generateRefreshToken(
      authEntity.user.publicId,
    );

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

  async refreshToken(data: RefreshTokenInput): Promise<RefreshTokenResponse> {
    const validatedData = RefreshtokenSchema.parse(data);

    const decoded = this.jwtService.verifyRefreshToken(
      validatedData.refreshToken,
    );
    if (!decoded) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const authEntity = await this.authRepository.getById(decoded.id);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    const accessToken = this.jwtService.generateToken({
      id: authEntity.user.id,
      email: authEntity.user.email,
      publicId: authEntity.user.publicId,
    });

    const refreshToken = this.jwtService.generateRefreshToken(
      authEntity.user.publicId,
    );

    return RefreshTokenResponseSchema.parse({
      data: {
        accessToken,
        refreshToken,
      },
    });
  }

  async logout(data: LogoutInput): Promise<LogoutResponse> {
    const validatedData = LogoutSchema.parse(data);

    const decoded = this.jwtService.verifyRefreshToken(
      validatedData.refreshToken,
    );
    if (!decoded) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const authEntity = await this.authRepository.getById(decoded.id);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    return LogoutResponseSchema.parse({
      data: {
        success: true,
      },
    });
  }

  async sendPasswordReset(
    data: SendPasswordResetInput,
  ): Promise<SendPasswordResetResponse> {
    const validatedData = SendPasswordResetSchema.parse(data);

    const authEntity = await this.authRepository.getByEmail(
      validatedData.email,
    );
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    // Gera um código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expira em 5 minutos
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Guardar o email no lugar do userId para facilitar a recuperação
    await this.authRepository.createPasswordReset(
      validatedData.email,
      code,
      expiresAt,
    );

    // TODO: Enviar código por email
    console.log(`Código de reset: ${code}`);

    return SendPasswordResetResponseSchema.parse({
      data: {
        message: "Código de reset enviado para o email registrado.",
      },
    });
  }

  async checkPasswordReset(
    data: CheckPasswordResetInput,
  ): Promise<CheckPasswordResetResponse> {
    const validatedData = CheckPasswordResetSchema.parse(data);

    const reset = await this.authRepository.getPasswordReset(
      validatedData.code,
    );
    const isValid = reset !== null;

    return CheckPasswordResetResponseSchema.parse({
      data: {
        valid: isValid,
      },
    });
  }

  async resetPassword(
    data: ResetPasswordInput,
  ): Promise<ResetPasswordResponse> {
    const validatedData = ResetPasswordSchema.parse(data);

    const reset = await this.authRepository.getPasswordReset(
      validatedData.code,
    );
    if (!reset) {
      throw new Error("INVALID_RESET_CODE");
    }

    const authEntity = await this.authRepository.getByEmail(reset.email);
    if (!authEntity) {
      throw new Error("USER_NOT_FOUND");
    }

    // Hash a nova senha
    const hashedPassword = await SecurityUtils.hashPassword(
      validatedData.newPassword,
    );

    // Atualizar senha do usuário
    await this.authRepository.updateUserPassword(
      authEntity.user.id,
      hashedPassword,
    );

    // Deletar o código de reset
    await this.authRepository.deletePasswordReset(validatedData.code);

    return ResetPasswordResponseSchema.parse({
      data: {
        message: "Senha atualizada com sucesso.",
      },
    });
  }
}
