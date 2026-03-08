ALTER TABLE "game" RENAME TO "games";--> statement-breakpoint
ALTER TABLE "game_accounts" DROP CONSTRAINT "game_accounts_game_id_game_id_fk";
--> statement-breakpoint
ALTER TABLE "matches" DROP CONSTRAINT "matches_game_id_game_id_fk";
--> statement-breakpoint
ALTER TABLE "game_accounts" ADD CONSTRAINT "game_accounts_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;