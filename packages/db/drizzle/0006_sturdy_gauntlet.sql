ALTER TABLE "league" RENAME TO "leagues";--> statement-breakpoint
ALTER TABLE "league_members" DROP CONSTRAINT "league_members_league_id_league_id_fk";
--> statement-breakpoint
ALTER TABLE "league_rankings" DROP CONSTRAINT "league_rankings_league_id_league_id_fk";
--> statement-breakpoint
ALTER TABLE "leagues" DROP CONSTRAINT "league_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "league_members" ADD CONSTRAINT "league_members_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "league_rankings" ADD CONSTRAINT "league_rankings_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leagues" ADD CONSTRAINT "leagues_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;