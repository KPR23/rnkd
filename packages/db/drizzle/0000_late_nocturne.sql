CREATE TYPE "public"."platform_route" AS ENUM('br1', 'eun1', 'euw1', 'jp1', 'kr', 'la1', 'la2', 'me1', 'na1', 'oc1', 'ru', 'sg2', 'tr1', 'tw2', 'vn2');--> statement-breakpoint
CREATE TYPE "public"."regional_route" AS ENUM('americas', 'europe', 'asia', 'sea');--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"tag" text,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cs2_faceit_game_account_profiles" (
	"game_account_id" text PRIMARY KEY NOT NULL,
	"game_id" text DEFAULT 'cs2_faceit' NOT NULL,
	"faceit_nickname" text,
	"steam_nickname" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "cs2_faceit_game_account_profiles_game_id_is_cs2_faceit" CHECK ("cs2_faceit_game_account_profiles"."game_id" = 'cs2_faceit')
);
--> statement-breakpoint
CREATE TABLE "game_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"game_id" text NOT NULL,
	"external_id" text NOT NULL,
	"last_synced_at" timestamp,
	"is_tracked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lol_game_account_profiles" (
	"game_account_id" text PRIMARY KEY NOT NULL,
	"game_id" text DEFAULT 'lol' NOT NULL,
	"game_name" text NOT NULL,
	"tag_line" text NOT NULL,
	"profile_icon_id" integer NOT NULL,
	"summoner_level" integer NOT NULL,
	"regional_route" "regional_route" NOT NULL,
	"platform_route" "platform_route" NOT NULL,
	"last_match_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lol_game_account_profiles_game_id_is_lol" CHECK ("lol_game_account_profiles"."game_id" = 'lol')
);
--> statement-breakpoint
CREATE TABLE "league_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "league_rankings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"score" integer NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leagues" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lol_ranked_entries" (
	"game_account_id" text NOT NULL,
	"game_id" text DEFAULT 'lol' NOT NULL,
	"queue_type" text NOT NULL,
	"tier" text NOT NULL,
	"rank" text,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"hot_streak" boolean DEFAULT false NOT NULL,
	"inactive" boolean DEFAULT false NOT NULL,
	"synced_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "lol_ranked_entries_game_account_id_queue_type_pk" PRIMARY KEY("game_account_id","queue_type"),
	CONSTRAINT "lol_ranked_entries_game_id_is_lol" CHECK ("lol_ranked_entries"."game_id" = 'lol')
);
--> statement-breakpoint
CREATE TABLE "elo_history" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text,
	"game_account_id" text NOT NULL,
	"elo" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" text NOT NULL,
	"game_account_id" text NOT NULL,
	"team" integer NOT NULL,
	"party_id" text,
	"win" boolean NOT NULL,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL,
	"assists" integer NOT NULL,
	"total_minions_killed" integer,
	"champion_id" integer NOT NULL,
	"champion_name" text NOT NULL,
	"champion_icon_url" text NOT NULL,
	"team_position" text NOT NULL,
	"individual_position" text NOT NULL,
	"elo_before" integer NOT NULL,
	"elo_after" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" text PRIMARY KEY NOT NULL,
	"game_id" text NOT NULL,
	"external_match_id" text NOT NULL,
	"queue_id" integer,
	"team1_score" integer NOT NULL,
	"team2_score" integer NOT NULL,
	"played_at" timestamp NOT NULL,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_stats" (
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
	CONSTRAINT "player_stats_game_account_id_unique" UNIQUE("game_account_id")
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_user_id" text NOT NULL,
	"addressee_user_id" text NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_no_self" CHECK ("friendships"."requester_user_id" <> "friendships"."addressee_user_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cs2_faceit_game_account_profiles" ADD CONSTRAINT "cs2_faceit_game_account_profiles_game_account_faceit_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_accounts" ADD CONSTRAINT "game_accounts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_accounts" ADD CONSTRAINT "game_accounts_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lol_game_account_profiles" ADD CONSTRAINT "lol_game_account_profiles_game_account_lol_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_rankings" ADD CONSTRAINT "league_rankings_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_rankings" ADD CONSTRAINT "league_rankings_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lol_ranked_entries" ADD CONSTRAINT "lol_ranked_entries_game_account_lol_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elo_history" ADD CONSTRAINT "elo_history_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elo_history" ADD CONSTRAINT "elo_history_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participants" ADD CONSTRAINT "match_participants_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_user_id_user_id_fk" FOREIGN KEY ("requester_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_user_id_user_id_fk" FOREIGN KEY ("addressee_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "game_accounts_game_external_unique" ON "game_accounts" USING btree ("game_id","external_id");--> statement-breakpoint
CREATE INDEX "game_accounts_user_idx" ON "game_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "game_accounts_last_synced_idx" ON "game_accounts" USING btree ("last_synced_at");--> statement-breakpoint
CREATE INDEX "lol_game_account_profiles_platform_idx" ON "lol_game_account_profiles" USING btree ("platform_route");--> statement-breakpoint
CREATE UNIQUE INDEX "league_members_league_account_unique" ON "league_members" USING btree ("league_id","game_account_id");--> statement-breakpoint
CREATE INDEX "league_members_league_idx" ON "league_members" USING btree ("league_id");--> statement-breakpoint
CREATE INDEX "league_members_account_idx" ON "league_members" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "league_rankings_league_idx" ON "league_rankings" USING btree ("league_id");--> statement-breakpoint
CREATE UNIQUE INDEX "league_rankings_league_account_unique" ON "league_rankings" USING btree ("league_id","game_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "league_rankings_league_position_unique" ON "league_rankings" USING btree ("league_id","position");--> statement-breakpoint
CREATE INDEX "lol_ranked_entries_account_idx" ON "lol_ranked_entries" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "lol_ranked_entries_synced_idx" ON "lol_ranked_entries" USING btree ("synced_at");--> statement-breakpoint
CREATE INDEX "elo_history_account_time_idx" ON "elo_history" USING btree ("game_account_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "match_participants_match_account_unique" ON "match_participants" USING btree ("match_id","game_account_id");--> statement-breakpoint
CREATE INDEX "participants_match_idx" ON "match_participants" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "participants_account_idx" ON "match_participants" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "matches_game_idx" ON "matches" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "matches_played_at_idx" ON "matches" USING btree ("played_at");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_game_external_unique" ON "matches" USING btree ("game_id","external_match_id");--> statement-breakpoint
CREATE INDEX "players_stats_account_idx" ON "player_stats" USING btree ("game_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "friendships_requester_addressee_unique" ON "friendships" USING btree ("requester_user_id","addressee_user_id");--> statement-breakpoint
CREATE INDEX "friendships_addressee_status_idx" ON "friendships" USING btree ("addressee_user_id","status");--> statement-breakpoint
CREATE INDEX "friendships_requester_status_idx" ON "friendships" USING btree ("requester_user_id","status");