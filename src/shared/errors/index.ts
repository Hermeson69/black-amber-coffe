import pino from "pino";
import { isDev } from "@/config/env";

export const logger = pino({
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "2024-01-01T00:00:00.000Z",
          singleLine: true,
          ignore: "pid,hostname",
          messageFormat: "{levelLabel}: {msg}",
        },
      }
    : undefined,
});
