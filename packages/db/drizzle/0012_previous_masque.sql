ALTER TABLE "game_accounts" RENAME COLUMN "region" TO "regional_route";--> statement-breakpoint
ALTER TABLE "game_accounts" ADD COLUMN "platform_route" text;