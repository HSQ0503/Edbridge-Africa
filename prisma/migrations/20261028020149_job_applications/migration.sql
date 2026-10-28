-- AlterEnum
ALTER TYPE "app"."Inbox" ADD VALUE 'recruitment';

-- CreateTable
CREATE TABLE "intake"."attachment" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "payload" BYTEA NOT NULL,

    CONSTRAINT "attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attachment_submission_id_key" ON "intake"."attachment"("submission_id");

-- AddForeignKey
ALTER TABLE "intake"."attachment" ADD CONSTRAINT "attachment_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "intake"."submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
