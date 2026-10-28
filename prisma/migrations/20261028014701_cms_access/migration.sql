-- CreateEnum
CREATE TYPE "app"."CmsRole" AS ENUM ('writer', 'publisher', 'safeguarding_reviewer');

-- CreateTable
CREATE TABLE "app"."cms_access" (
    "user_id" TEXT NOT NULL,
    "role" "app"."CmsRole" NOT NULL,
    "granted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_access_pkey" PRIMARY KEY ("user_id","role")
);

-- AddForeignKey
ALTER TABLE "app"."cms_access" ADD CONSTRAINT "cms_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
