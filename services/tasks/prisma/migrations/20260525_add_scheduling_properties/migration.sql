-- AlterTable
ALTER TABLE "tasks" ADD COLUMN "time_estimate" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "urgency" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "importance" INTEGER;
ALTER TABLE "tasks" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;

-- BackfillPosition
UPDATE "tasks" AS t SET "position" = sub.rn - 1
FROM (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "list_id" ORDER BY "created_at") AS rn
    FROM "tasks"
) AS sub
WHERE t."id" = sub."id";
