CREATE TABLE "elo_history" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text,
	"game_account_id" text NOT NULL,
	"elo" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"follower_user_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"game_id" text NOT NULL,
	"external_id" text NOT NULL,
	"nickname" text,
	"region" text,
	"last_synced_at" timestamp,
	"last_match_id" text,
	"is_tracked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league_members" (
	"league_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league_rankings" (
	"league_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"score" integer NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_participants" (
	"match_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"team" integer NOT NULL,
	"party_id" text,
	"win" boolean NOT NULL,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL,
	"assists" integer NOT NULL,
	"elo_before" integer NOT NULL,
	"elo_after" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"external_match_id" text NOT NULL,
	"team1_score" integer NOT NULL,
	"team2_score" integer NOT NULL,
	"played_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "matches_external_match_id_unique" UNIQUE("external_match_id")
);
--> statement-breakpoint
CREATE TABLE "players_stats" (
	"game_account_id" text NOT NULL,
	"total_matches" integer NOT NULL,
	"total_wins" integer NOT NULL,
	"win_rate" real NOT NULL,
	"current_elo" integer NOT NULL,
	"avg_kills" real NOT NULL,
	"avg_deaths" real NOT NULL,
	"avg_assists" real NOT NULL,
	"last_calculated_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "players_stats_game_account_id_unique" UNIQUE("game_account_id")
);
--> statement-breakpoint
ALTER TABLE "elo_history" ADD CONSTRAINT "elo_history_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elo_history" ADD CONSTRAINT "elo_history_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_user_id_user_id_fk" FOREIGN KEY ("follower_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_accounts" ADD CONSTRAINT "game_accounts_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league" ADD CONSTRAINT "league_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_rankings" ADD CONSTRAINT "league_rankings_league_id_league_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."league"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_rankings" ADD CONSTRAINT "league_rankings_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players_stats" ADD CONSTRAINT "players_stats_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "elo_history_account_time_idx" ON "elo_history" USING btree ("game_account_id","created_at");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_user_id");--> statement-breakpoint
CREATE INDEX "follows_game_account_idx" ON "follows" USING btree ("game_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "game_accounts_game_external_unique" ON "game_accounts" USING btree ("game_id","external_id");--> statement-breakpoint
CREATE INDEX "game_accounts_user_idx" ON "game_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_accounts_last_synced_idx" ON "game_accounts" USING btree ("last_synced_at");--> statement-breakpoint
CREATE INDEX "league_members_league_idx" ON "league_members" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "league_members_account_idx" ON "league_members" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "league_rankings_league_idx" ON "league_rankings" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "league_rankings_position_idx" ON "league_rankings" USING btree ("league_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "match_participants_match_account_unique" ON "match_participants" USING btree ("match_id","game_account_id");--> statement-breakpoint
CREATE INDEX "participants_match_idx" ON "match_participants" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "participants_account_idx" ON "match_participants" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "matches_game_idx" ON "matches" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "matches_played_at_idx" ON "matches" USING btree ("played_at");--> statement-breakpoint
CREATE INDEX "players_stats_account_idx" ON "players_stats" USING btree ("game_account_id");