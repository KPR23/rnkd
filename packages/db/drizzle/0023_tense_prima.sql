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
ALTER TABLE "cs2_faceit_game_account_profiles" ADD CONSTRAINT "cs2_faceit_game_account_profiles_game_account_faceit_fk" FOREIGN KEY ("game_account_id","game_id") REFERENCES "public"."game_accounts"("id","game_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lol_game_account_profiles" ADD CONSTRAINT "lol_game_account_profiles_game_account_lol_fk" FOREIGN KEY ("game_account_id","game_id") REFERENCES "public"."game_accounts"("id","game_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lol_game_account_profiles_platform_idx" ON "lol_game_account_profiles" USING btree ("platform_route");--> statement-breakpoint
ALTER TABLE "game_accounts" DROP COLUMN "game_name";--> statement-breakpoint
ALTER TABLE "game_accounts" DROP COLUMN "tag_line";--> statement-breakpoint
ALTER TABLE "game_accounts" DROP COLUMN "profile_icon_id";--> statement-breakpoint
ALTER TABLE "game_accounts" DROP COLUMN "summoner_level";--> statement-breakpoint
ALTER TABLE "game_accounts" DROP COLUMN "regional_route";--> statement-breakpoint
ALTER TABLE "game_accounts" DROP COLUMN "platform_route";--> statement-breakpoint
ALTER TABLE "game_accounts" DROP COLUMN "last_match_id";