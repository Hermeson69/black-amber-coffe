import { Router } from "express";
import { healthRoutes } from "@/modules/health/health.routes";
import { authRoutes } from "@/modules/auth/auth.routes";
import { userRoutes } from "@/modules/user/user.routes";
import { workerRoutes } from "@/modules/worker/worker.routes";
import setupSwagger from "@/shared/swagger";

const routes = Router();

routes.use(healthRoutes);
routes.use("/api", authRoutes);
routes.use("/api", userRoutes);
routes.use("/api", workerRoutes);

setupSwagger(routes);

export default routes;
