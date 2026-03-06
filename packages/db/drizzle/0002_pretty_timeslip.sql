ALTER TABLE "matches" DROP CONSTRAINT "matches_external_match_id_unique";--> statement-breakpoint
DROP INDEX "league_rankings_position_idx";--> statement-breakpoint
ALTER TABLE "game_accounts" ADD CONSTRAINT "game_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "follows_follower_account_unique" ON "follows" USING btree ("follower_user_id","game_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "league_members_league_account_unique" ON "league_members" USING btree ("league_id","game_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "league_rankings_league_account_unique" ON "league_rankings" USING btree ("league_id","game_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "league_rankings_league_position_unique" ON "league_rankings" USING btree ("league_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_game_external_unique" ON "matches" USING btree ("game_id","external_match_id");