DELETE FROM "elo_history" AS older
USING "elo_history" AS newer
WHERE older."game_account_id" = newer."game_account_id"
  AND older."match_id" = newer."match_id"
  AND older."match_id" IS NOT NULL
  AND older."created_at" < newer."created_at";--> statement-breakpoint
CREATE UNIQUE INDEX "elo_history_account_match_unique" ON "elo_history" USING btree ("game_account_id","match_id") WHERE "match_id" IS NOT NULL;
