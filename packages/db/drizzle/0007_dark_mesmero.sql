ALTER TABLE "players_stats" RENAME TO "player_stats";--> statement-breakpoint
ALTER TABLE "player_stats" DROP CONSTRAINT "players_stats_game_account_id_unique";--> statement-breakpoint
ALTER TABLE "player_stats" DROP CONSTRAINT "players_stats_game_account_id_game_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_game_account_id_unique" UNIQUE("game_account_id");