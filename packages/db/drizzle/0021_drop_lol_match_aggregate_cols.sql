DROP INDEX "matches_game_queue_idx";--> statement-breakpoint
ALTER TABLE "match_participants" DROP COLUMN "total_cs";--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN "queue_id";--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN "duration_seconds";