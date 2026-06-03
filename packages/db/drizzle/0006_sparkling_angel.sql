ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "bio" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "favorite_game_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "region" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "global_rs" integer DEFAULT 0 NOT NULL;
