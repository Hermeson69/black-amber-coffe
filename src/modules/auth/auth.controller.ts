import authService from "./auth.service";

import { LoginInput, LoginResponse, RegisterInput, RegisterResponse } from "./auth.schema";
import { Request, Response } from "express";

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
      res.status(400).json({ error: (error as Error).message });
    }
  };

  async login(req: Request, res: Response): Promise<void>{
    try{
      const data: LoginInput = req.body;
      const loginResponse: LoginResponse =
        await this.authService.login(data);
      res.status(201).json(loginResponse);
    }catch (error){
      res.status(400).json({error: (error as Error).message})
    }
  }
}
