import authService from "@/modules/auth/auth.service";

import {
  LoginInput,
  LoginResponse,
  RegisterInput,
  RegisterResponse,
} from "@/modules/auth/auth.schema";
import { Request, Response } from "express";
import handlers from "@/shared/handlers/handles";
import helpers from "@/shared/helpers";

function handleError(res: Response, err: unknown) {
  const code = err instanceof Error ? err.message : "INTERNAL_ERROR";

  const mapped = helpers[code] ?? {
    status: 500,
    message: "Erro interno no servidor.",
  };

  return res.status(mapped.status).json({
    error: {
      code: mapped.status === 500 ? "INTERNAL_ERROR" : code,
      message: mapped.message,
    },
  });
}

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
      handleError(res, error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginInput = req.body;
      const loginResponse: LoginResponse = await this.authService.login(data);
      res.status(201).json(loginResponse);
    } catch (error) {
      handleError(res, error);
    }
  }
}
