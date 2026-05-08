import { is } from "drizzle-orm";
import { WorkerRoles } from "../core/enuns/workerRole";

import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

export const WorkerRolesEnum = pgEnum("worker_roles", WorkerRoles.values());

export const Clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const Workers = pgTable("workers", {
  id: serial("id").primaryKey(),
  publicId: text("public_id").notNull(),
  role: WorkerRolesEnum("role").notNull(),
  salary: numeric("salary").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const WorkerProfiles = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  workerId: integer("worker_id")
    .notNull()
    .references(() => Workers.id),
  email: text("email").notNull(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarImage: text("avatar_image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const Profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => Clients.id),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  avatarImage: text("avatar_image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});
