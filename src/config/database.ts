import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";
import {env} from "@/config/env";

if(!env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in environment variables.");
}

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });

export type { schema };
