import authService from "./auth.service";

import { RegisterInput, ClientResponse } from "./auth.schema";
import { Request, Response } from "express";

export default class authController {
  private authService: authService;

  constructor(authService: authService) {
    this.authService = authService;
  }

  async createClient(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterInput = req.body;
      const clientResponse: ClientResponse =
        await this.authService.create(data);
      res.status(201).json(clientResponse);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }
}
