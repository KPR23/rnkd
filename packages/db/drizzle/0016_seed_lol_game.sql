INSERT INTO "games" ("id", "name")
VALUES ('lol', 'League of Legends')
ON CONFLICT ("id") DO NOTHING;
