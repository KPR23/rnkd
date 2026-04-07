CREATE UNIQUE INDEX "game_accounts_id_game_id_unique" ON "game_accounts" USING btree ("id","game_id");--> statement-breakpoint
ALTER TABLE "lol_ranked_entries" DROP CONSTRAINT "lol_ranked_entries_game_account_id_game_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "lol_ranked_entries" ADD COLUMN "game_id" text DEFAULT 'lol' NOT NULL;--> statement-breakpoint
ALTER TABLE "lol_ranked_entries" ADD CONSTRAINT "lol_ranked_entries_game_account_lol_fk" FOREIGN KEY ("game_account_id","game_id") REFERENCES "public"."game_accounts"("id","game_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lol_ranked_entries" ADD CONSTRAINT "lol_ranked_entries_game_id_is_lol" CHECK ("lol_ranked_entries"."game_id" = 'lol');
