CREATE TYPE "group_member_role" AS ENUM ('owner', 'member');--> statement-breakpoint
CREATE TYPE "group_member_status" AS ENUM ('active', 'invited');--> statement-breakpoint
CREATE TABLE "groups" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "invite_code" text NOT NULL,
  "owner_user_id" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "group_members" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "group_id" uuid NOT NULL,
  "user_id" text NOT NULL,
  "role" "group_member_role" DEFAULT 'member' NOT NULL,
  "status" "group_member_status" DEFAULT 'active' NOT NULL,
  "invited_by_user_id" text,
  "joined_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_invited_by_user_id_user_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "groups_invite_code_unique" ON "groups" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX "groups_owner_idx" ON "groups" USING btree ("owner_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "group_members_group_user_unique" ON "group_members" USING btree ("group_id","user_id");--> statement-breakpoint
CREATE INDEX "group_members_group_status_idx" ON "group_members" USING btree ("group_id","status");--> statement-breakpoint
CREATE INDEX "group_members_user_status_idx" ON "group_members" USING btree ("user_id","status");
