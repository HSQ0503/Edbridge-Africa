-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "intake";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "safeguarding";

-- CreateEnum
CREATE TYPE "app"."Inbox" AS ENUM ('volunteer', 'enquiries', 'partnerships', 'fundraising', 'support', 'complaints', 'misconduct', 'safeguarding');

-- CreateEnum
CREATE TYPE "app"."SubmissionStatus" AS ENUM ('new', 'in_progress', 'closed');

-- CreateTable
CREATE TABLE "app"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "two_factor_enabled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "last_active_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ(3),
    "refresh_token_expires_at" TIMESTAMPTZ(3),
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."two_factor" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "backup_codes" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "verified" BOOLEAN DEFAULT true,
    "failed_verification_count" INTEGER DEFAULT 0,
    "locked_until" TIMESTAMPTZ(3),

    CONSTRAINT "two_factor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."inbox_access" (
    "user_id" TEXT NOT NULL,
    "inbox" "app"."Inbox" NOT NULL,
    "granted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbox_access_pkey" PRIMARY KEY ("user_id","inbox")
);

-- CreateTable
CREATE TABLE "intake"."submission" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "form" TEXT NOT NULL,
    "inbox" "app"."Inbox" NOT NULL,
    "status" "app"."SubmissionStatus" NOT NULL DEFAULT 'new',
    "payload" TEXT NOT NULL,
    "received_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safeguarding"."concern" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL,
    "status" "app"."SubmissionStatus" NOT NULL DEFAULT 'new',
    "payload" TEXT NOT NULL,
    "received_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "concern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."event" (
    "id" BIGSERIAL NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "actor_id" TEXT,
    "action" TEXT NOT NULL,
    "target_type" TEXT,
    "target_id" TEXT,
    "detail" TEXT,
    "prev_hash" TEXT NOT NULL,
    "hash" TEXT NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "app"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "app"."session"("token");

-- CreateIndex
CREATE INDEX "session_user_id_idx" ON "app"."session"("user_id");

-- CreateIndex
CREATE INDEX "account_user_id_idx" ON "app"."account"("user_id");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "app"."verification"("identifier");

-- CreateIndex
CREATE INDEX "two_factor_secret_idx" ON "app"."two_factor"("secret");

-- CreateIndex
CREATE INDEX "two_factor_user_id_idx" ON "app"."two_factor"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "submission_reference_key" ON "intake"."submission"("reference");

-- CreateIndex
CREATE INDEX "submission_inbox_status_received_at_idx" ON "intake"."submission"("inbox", "status", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "concern_reference_key" ON "safeguarding"."concern"("reference");

-- CreateIndex
CREATE INDEX "concern_status_received_at_idx" ON "safeguarding"."concern"("status", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "event_hash_key" ON "audit"."event"("hash");

-- CreateIndex
CREATE INDEX "event_action_target_id_occurred_at_idx" ON "audit"."event"("action", "target_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "app"."session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."two_factor" ADD CONSTRAINT "two_factor_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."inbox_access" ADD CONSTRAINT "inbox_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Audit events are append-only (PLAN.md §10). This holds even for the table owner;
-- in staging/production the app role additionally gets INSERT/SELECT only.
CREATE FUNCTION "audit"."reject_change"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit.event is append-only';
END;
$$;

CREATE TRIGGER "event_no_update_or_delete" BEFORE UPDATE OR DELETE ON "audit"."event"
  FOR EACH ROW EXECUTE FUNCTION "audit"."reject_change"();

CREATE TRIGGER "event_no_truncate" BEFORE TRUNCATE ON "audit"."event"
  FOR EACH STATEMENT EXECUTE FUNCTION "audit"."reject_change"();
