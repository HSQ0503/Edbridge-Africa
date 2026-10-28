-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "app"."Inbox" ADD VALUE 'about_executive';
ALTER TYPE "app"."Inbox" ADD VALUE 'about_safeguarding_lead';

-- DropIndex
DROP INDEX "safeguarding"."concern_status_received_at_idx";

-- AlterTable
ALTER TABLE "safeguarding"."concern" ADD COLUMN     "inbox" "app"."Inbox" NOT NULL DEFAULT 'safeguarding';

-- CreateIndex
CREATE INDEX "concern_inbox_status_received_at_idx" ON "safeguarding"."concern"("inbox", "status", "received_at");
