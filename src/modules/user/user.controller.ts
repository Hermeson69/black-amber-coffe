import userService from "./user.service";
import { GetUserResponseSchema, UpdateUserResponseSchema } from "./user.schema";
import { Request, Response } from "express";

export default class userController {
  private userService: userService;

  constructor(userService: userService) {
    this.userService = userService;
  }

  /**
   * GET /user/me
   * Retrieve authenticated user details
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await this.userService.get(publicId);

      const response = GetUserResponseSchema.parse({
        data: user,
      });

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  /**
   * PATCH /user/me
   * Update authenticated user information
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const data = req.body;

      const updatedUser = await this.userService.updateClient(publicId, data);

      const response = UpdateUserResponseSchema.parse({
        data: updatedUser,
        message: "User updated successfully",
      });

      res.status(200).json(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "User not found") {
          res.status(404).json({ error: "User not found" });
        } else if (
          error.message.includes("at least one field must be provided")
        ) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  /**
   * DELETE /user/me
   * Delete authenticated user and all related data
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      await this.userService.deleteClient(publicId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === "User not found") {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
