CREATE TABLE "lol_ranked_entries" (
	"game_account_id" text NOT NULL,
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
	CONSTRAINT "lol_ranked_entries_game_account_id_queue_type_pk" PRIMARY KEY("game_account_id","queue_type")
);
--> statement-breakpoint
ALTER TABLE "lol_ranked_entries" ADD CONSTRAINT "lol_ranked_entries_game_account_id_game_accounts_id_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lol_ranked_entries_account_idx" ON "lol_ranked_entries" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "lol_ranked_entries_synced_idx" ON "lol_ranked_entries" USING btree ("synced_at");