CREATE TABLE "cs2_faceit_match_players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"team" integer NOT NULL,
	"win" boolean NOT NULL,
	"kills" integer,
	"deaths" integer,
	"assists" integer,
	"adr" real,
	"headshot_pct" real,
	"raw_stats" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cs2_faceit_match_players_kills_nonnegative" CHECK ("cs2_faceit_match_players"."kills" >= 0),
	CONSTRAINT "cs2_faceit_match_players_deaths_nonnegative" CHECK ("cs2_faceit_match_players"."deaths" >= 0),
	CONSTRAINT "cs2_faceit_match_players_assists_nonnegative" CHECK ("cs2_faceit_match_players"."assists" >= 0),
	CONSTRAINT "cs2_faceit_match_players_adr_nonnegative" CHECK ("cs2_faceit_match_players"."adr" >= 0),
	CONSTRAINT "cs2_faceit_match_players_headshot_pct_range" CHECK ("cs2_faceit_match_players"."headshot_pct" BETWEEN 0 AND 100)
);
--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD COLUMN "last_faceit_match_id" text;--> statement-breakpoint
ALTER TABLE "cs2_faceit_match_players" ADD CONSTRAINT "cs2_faceit_match_players_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cs2_faceit_match_players" ADD CONSTRAINT "cs2_faceit_match_players_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "cs2_faceit_match_players_match_account_unique" ON "cs2_faceit_match_players" USING btree ("match_id","game_account_id");--> statement-breakpoint
CREATE INDEX "cs2_faceit_match_players_match_idx" ON "cs2_faceit_match_players" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "cs2_faceit_match_players_account_idx" ON "cs2_faceit_match_players" USING btree ("game_account_id");