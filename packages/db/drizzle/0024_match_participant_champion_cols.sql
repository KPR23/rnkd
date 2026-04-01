ALTER TABLE "match_participants" ADD COLUMN "total_minions_killed" integer;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "champion_id" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "champion_name" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "champion_icon_url" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "team_position" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "match_participants" ADD COLUMN "individual_position" text DEFAULT '' NOT NULL;