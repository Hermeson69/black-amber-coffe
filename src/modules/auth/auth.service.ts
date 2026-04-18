import JWTservice from "../../core/jwt.service";
import authModel from "./auth.model";
import authRepository from "./auth.repository";
import SecurityUtils from "../../core/security";

import {
  RegisterInput,
  SignupInput,
  LoginInput,
  ClientResponse,
  RegisterClientSchema,
  SignupSchema,
  LoginClientSchema,
  ClentResponseSchema,
} from "./auth.schema";

export default class authService {
  private authRepository: authRepository;
  private jwtService: JWTservice;

  constructor(authRepository: authRepository, jwtService: JWTservice) {
    this.authRepository = authRepository;
    this.jwtService = jwtService;
  }

  async create(data: RegisterInput): Promise<ClientResponse> {
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
    return ClentResponseSchema.parse({
      publicId: createdClient.publicId,
      name: createdClient.name,
      email: createdClient.email,
      createdAt: createdClient.createdAt,
      updatedAt: createdClient.updatedAt,
      lastLogin: createdClient.lastLogin,
    });
  }
}
