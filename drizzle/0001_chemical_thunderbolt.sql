ALTER TABLE "clients" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "lastLogin" text NOT NULL;