-- AlterTable
ALTER TABLE "app"."user" ADD COLUMN "is_staff_admin" BOOLEAN NOT NULL DEFAULT false;

-- Until now accounts could only be created from the command line, by whoever set the site up, so the
-- accounts that exist are theirs. They become the first staff admins.
UPDATE "app"."user" SET "is_staff_admin" = true;
