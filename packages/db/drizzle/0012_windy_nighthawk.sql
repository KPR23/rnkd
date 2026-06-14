CREATE TABLE "feed_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_post_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_post_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"author_user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_comment_likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"comment_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feed_posts" ADD CONSTRAINT "feed_posts_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_likes" ADD CONSTRAINT "feed_post_likes_post_id_feed_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."feed_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_likes" ADD CONSTRAINT "feed_post_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_comments" ADD CONSTRAINT "feed_post_comments_post_id_feed_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."feed_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_post_comments" ADD CONSTRAINT "feed_post_comments_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_comment_likes" ADD CONSTRAINT "feed_comment_likes_comment_id_feed_post_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."feed_post_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_comment_likes" ADD CONSTRAINT "feed_comment_likes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "feed_posts_author_created_idx" ON "feed_posts" USING btree ("author_user_id","created_at");--> statement-breakpoint
CREATE INDEX "feed_posts_created_idx" ON "feed_posts" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "feed_post_likes_post_user_unique" ON "feed_post_likes" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "feed_post_likes_post_idx" ON "feed_post_likes" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "feed_post_comments_post_created_idx" ON "feed_post_comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "feed_comment_likes_comment_user_unique" ON "feed_comment_likes" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "feed_comment_likes_comment_idx" ON "feed_comment_likes" USING btree ("comment_id");
