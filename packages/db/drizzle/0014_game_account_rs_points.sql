CREATE TABLE "game_account_rs_points" (
	"game_account_id" text NOT NULL,
	"source_key" text NOT NULL,
	"game_id" text NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "game_account_rs_points_game_account_id_source_key_pk" PRIMARY KEY("game_account_id","source_key")
);
--> statement-breakpoint
ALTER TABLE "game_account_rs_points" ADD CONSTRAINT "game_account_rs_points_game_account_fk" FOREIGN KEY ("game_account_id") REFERENCES "public"."game_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "game_account_rs_points_account_idx" ON "game_account_rs_points" USING btree ("game_account_id");--> statement-breakpoint
CREATE INDEX "game_account_rs_points_game_idx" ON "game_account_rs_points" USING btree ("game_id");
