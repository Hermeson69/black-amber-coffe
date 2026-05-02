import authService from "@/modules/auth/auth.service";

import {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from "@/modules/auth/auth.schema";
import { Request, Response } from "express";
import handlers from "@/shared/handlers/handles";

export default class authController {
  private authService: authService;

  constructor(authService: authService) {
    this.authService = authService;
  }

  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterInput = req.body;
      const clientResponse: RegisterResponse =
        await this.authService.create(data);
      res.status(201).json(clientResponse);
    } catch (error) {
      handlers.error(res, error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const loginResponse: LoginResponse = await this.authService.login(data);
      res.status(201).json(loginResponse);
    } catch (error) {
      handlers.error(res, error);
    }
  }
}
