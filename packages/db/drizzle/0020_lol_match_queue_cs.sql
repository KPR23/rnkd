ALTER TABLE "match_participants" ADD COLUMN "total_cs" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "queue_id" integer;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "duration_seconds" integer;--> statement-breakpoint
CREATE INDEX "matches_game_queue_idx" ON "matches" USING btree ("game_id","queue_id");