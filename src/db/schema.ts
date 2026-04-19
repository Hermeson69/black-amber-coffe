import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const Clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  phone: text("phone"),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});

export const Profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  fullName: text("full_name").notNull(),
  avatarImage: text("avatar_image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
