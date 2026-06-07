CREATE UNIQUE INDEX "groups_name_unique" ON "groups" USING btree (lower("name"));
