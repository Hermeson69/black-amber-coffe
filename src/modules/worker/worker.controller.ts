import WorkerService from "./worker.service";
import {
  GetWorkerResponseSchema,
  UpdateWorkerResponseSchema,
} from "./worker.schema";
import { Request, Response } from "express";
import sharedHandlers from "@/shared/handlers/handles";

function handleError(res: Response, err: unknown) {
  return sharedHandlers.error(res, err);
}

export default class WorkerController {
  private workerService: WorkerService;

  constructor(workerService: WorkerService) {
    this.workerService = workerService;
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const worker = await this.workerService.getByPublicId(publicId);

      const response = GetWorkerResponseSchema.parse({
        data: worker,
      });

      res.status(200).json(response);
    } catch (error) {
      handleError(res, error);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const data = req.body;

      const updatedWorker = await this.workerService.update(publicId, data);

      const response = UpdateWorkerResponseSchema.parse({
        data: updatedWorker,
        message: "Worker updated successfully",
      });

      res.status(200).json(response);
    } catch (error) {
      handleError(res, error);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const publicId = req.user?.publicId;
      if (!publicId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      await this.workerService.delete(publicId);

      res.status(204).send();
    } catch (error) {
      handleError(res, error);
    }
  }
}
