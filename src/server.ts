import "dotenv/config";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import express from "express";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 3000;

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
        url: `http://localhost:${PORT}`,
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
  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(healthRoutes);
app.use("/api", authRoutes);

app.listen(PORT, async () => {
  console.log(`🚀 Server running on PORT ${PORT}`);
  console.log(`📚 Docs available at http://localhost:${PORT}/docs`);
});
