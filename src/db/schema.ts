import { pgTable, serial, text, numeric } from "drizzle-orm/pg-core";

export const Clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
  lastLogin: text().notNull(),
});