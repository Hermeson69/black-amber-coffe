import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";

export const Clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});