INSERT INTO "games" ("id", "name")
VALUES ('cs2_faceit', 'CS2 (FACEIT)')
ON CONFLICT ("id") DO NOTHING;
