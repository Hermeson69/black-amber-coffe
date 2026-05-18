import "dotenv/config";
import express, { Response } from "express";
import fs from "node:fs";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import { healthRoutes } from "@/routes/health.routes";
import { authRoutes } from "@/routes/auth.routes";
import { userRoutes } from "@/routes/user.routes";
import { seed } from "@/seed/seed";
import { workerRoutes } from "@/routes/worker.routes";
import { env } from "@/config/env";
const app = express();
const PORT = env.PORT || 3000;

const swaggerRouteGlobs = [
  path.join(__dirname, "routes", "*.ts"),
  path.join(__dirname, "routes", "*.js"),
].filter((glob) => fs.existsSync(path.dirname(glob)));

app.use(express.json());

app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  const startedAt = new Date().toISOString();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(
      `${startedAt} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${durationMs.toFixed(2)} ms`,
    );
  });

  next();
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Black Amber Coffes API",
      description: "Documentação da API utilizando Express",
      version: "1.0.0",
    },
    servers: [
      {
        url: "/v1",
        description: "API v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT obtido no login",
        },
      },
    },
  },
  apis: swaggerRouteGlobs,
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/v1/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(healthRoutes);
app.use("/api", healthRoutes);
app.use("/v1/api", authRoutes);
app.use("/v1/api", userRoutes);
app.use("/v1/api", workerRoutes);

app.use((_req, res: Response) => {
  res.status(404).json({ data: { message: "not found" } });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
  console.log(`📚 Docs v1 available at http://localhost:${PORT}/v1/docs`);

  if (process.env.NODE_ENV !== "production") {
    try {
      await seed();
    } catch (error) {
      console.error("❌ Erro ao executar seed:", error);
    }
  }
});
