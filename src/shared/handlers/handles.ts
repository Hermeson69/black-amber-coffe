import { Response } from "express";
import { ZodError } from "zod";
import helpers from "@/shared/helpers";
import { env } from "@/config/env";
import { logger } from "@/shared/errors";

const error = (res: Response, err: unknown) => {
  // Zod validation errors -> return 400 with details
  if (err instanceof ZodError) {
    const details: Record<string, string> = {};
    err.issues.forEach((issue) => {
      const key = issue.path.join(".") || "body";
      if (!details[key]) details[key] = issue.message;
    });

    const mapped = helpers["BAD_REQUEST"] ?? {
      status: 400,
      message: "Requisição inválida. Verifique os campos.",
    };

    return res.status(mapped.status).json({
      error: {
        code: "BAD_REQUEST",
        message: mapped.message,
        details,
      },
    });
  }

  let code = err instanceof Error ? err.message : "INTERNAL_ERROR";

  const mapped = helpers[code] ?? {
    status: 500,
    message: "Erro interno no servidor.",
  };

  if (env.isDev && mapped.status == 500) {
    logger.error(code);
    mapped.message = code;
  }

  if (mapped.status == 500) {
    code = "INTERNAL_ERROR";
  }

  return res.status(mapped.status).json({
    error: {
      code,
      message: mapped.message,
    },
  });
};

export default {
  error,
};
