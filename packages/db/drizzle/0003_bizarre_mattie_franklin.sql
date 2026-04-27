CREATE TABLE "cs2_faceit_ranked_entries" (
	"game_account_id" text NOT NULL,
	"game_id" text DEFAULT 'cs2_faceit' NOT NULL,
	"game_key" text NOT NULL,
	"faceit_elo" integer,
	"skill_level" integer,
	"region" text,
	"game_player_id" text,
	"game_player_name" text,
	"synced_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cs2_faceit_ranked_entries_game_account_id_game_key_pk" PRIMARY KEY("game_account_id","game_key"),
	CONSTRAINT "cs2_faceit_ranked_entries_game_id_is_cs2_faceit" CHECK ("cs2_faceit_ranked_entries"."game_id" = 'cs2_faceit')
);
--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD COLUMN IF NOT EXISTS "avatar" text;--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD COLUMN IF NOT EXISTS "membership_type" text;--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD COLUMN IF NOT EXISTS "verified" boolean;--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD COLUMN IF NOT EXISTS "activated_at" timestamp;--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD COLUMN IF NOT EXISTS "synced_at" timestamp;--> statement-breakpoint
ALTER TABLE "cs2_faceit_ranked_entries" ADD CONSTRAINT "cs2_faceit_ranked_entries_game_account_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cs2_faceit_ranked_entries_account_idx" ON "cs2_faceit_ranked_entries" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "cs2_faceit_ranked_entries_synced_idx" ON "cs2_faceit_ranked_entries" USING btree ("synced_at");--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_depend d
    JOIN pg_type t ON d.refobjid = t.oid
    WHERE t.typnamespace = 'public'::regnamespace
      AND t.typname = 'platform_route'
      AND d.deptype != 'e'
  ) THEN
    DROP TYPE IF EXISTS "public"."platform_route";
  END IF;
END $$;--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_depend d
    JOIN pg_type t ON d.refobjid = t.oid
    WHERE t.typnamespace = 'public'::regnamespace
      AND t.typname = 'regional_route'
      AND d.deptype != 'e'
  ) THEN
    DROP TYPE IF EXISTS "public"."regional_route";
  END IF;
END $$;