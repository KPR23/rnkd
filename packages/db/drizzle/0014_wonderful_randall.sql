ALTER TABLE "game_accounts" ALTER COLUMN "platform_route" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."platform_route";--> statement-breakpoint
CREATE TYPE "public"."platform_route" AS ENUM('br1', 'eun1', 'euw1', 'jp1', 'kr', 'la1', 'la2', 'me1', 'na1', 'oc1', 'ru', 'sg2', 'tr1', 'tw2', 'vn2');--> statement-breakpoint
ALTER TABLE "game_accounts" ALTER COLUMN "platform_route" SET DATA TYPE "public"."platform_route" USING "platform_route"::"public"."platform_route";