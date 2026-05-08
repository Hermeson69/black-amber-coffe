CREATE TYPE "public"."worker_roles" AS ENUM('ADMIN', 'BARISTA', 'BARMAN', 'WAITER');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workers" (
	"id" serial PRIMARY KEY NOT NULL,
	"public_id" text NOT NULL,
	"role" "worker_roles" NOT NULL,
	"salary" numeric NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "worker_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"worker_id" integer NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"avatar_image" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_worker_id_workers_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."workers"("id") ON DELETE no action ON UPDATE no action;