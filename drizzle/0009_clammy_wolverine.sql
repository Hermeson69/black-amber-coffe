ALTER TABLE "worker_profiles" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD COLUMN "password" text NOT NULL;--> statement-breakpoint
ALTER TABLE "workers" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "workers" DROP COLUMN "password";