CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"avatar_image" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
