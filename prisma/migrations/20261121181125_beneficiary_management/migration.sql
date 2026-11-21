-- CreateEnum
CREATE TYPE "app"."BeneficiaryRole" AS ENUM ('registrar', 'assessor', 'approver', 'sensitive', 'reports');

-- CreateEnum
CREATE TYPE "app"."BeneficiaryStatus" AS ENUM ('newly_registered', 'under_assessment', 'awaiting_verification', 'under_review', 'approved', 'active', 'waiting_list', 'not_selected', 'suspended', 'graduated', 'referred', 'closed');

-- CreateEnum
CREATE TYPE "app"."AssessmentStatus" AS ENUM ('draft', 'submitted');

-- CreateEnum
CREATE TYPE "app"."DecisionOutcome" AS ENUM ('approved', 'waiting_list', 'referred', 'further_assessment', 'not_selected');

-- CreateEnum
CREATE TYPE "app"."CaseNoteKind" AS ENUM ('note', 'support', 'progress', 'follow_up', 'referral', 'communication');

-- CreateEnum
CREATE TYPE "app"."AssistanceStatus" AS ENUM ('requested', 'pending', 'approved', 'delivered', 'cancelled');

-- CreateTable
CREATE TABLE "app"."beneficiary_access" (
    "user_id" TEXT NOT NULL,
    "role" "app"."BeneficiaryRole" NOT NULL,
    "granted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "beneficiary_access_pkey" PRIMARY KEY ("user_id","role")
);

-- CreateTable
CREATE TABLE "app"."household" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "guardian_name" TEXT NOT NULL,
    "guardian_phone" TEXT,
    "guardian_alt_phone" TEXT,
    "guardian_occupation" TEXT,
    "guardian_employment" TEXT,
    "guardian_address" TEXT,
    "emergency_contact" TEXT,
    "primary_caregiver" TEXT,
    "members_count" INTEGER,
    "dependants_count" INTEGER,
    "children_count" INTEGER,
    "children_in_school" INTEGER,
    "children_out_of_school" INTEGER,
    "income_source" TEXT,
    "income_range" TEXT,
    "housing" TEXT,
    "circumstances" TEXT[],
    "circumstances_other" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "household_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."beneficiary" (
    "id" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "status" "app"."BeneficiaryStatus" NOT NULL DEFAULT 'newly_registered',
    "full_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "dob_estimated" BOOLEAN NOT NULL DEFAULT false,
    "gender" TEXT NOT NULL,
    "nationality" TEXT,
    "region" TEXT NOT NULL,
    "district" TEXT,
    "community" TEXT,
    "residential_location" TEXT,
    "contact_number" TEXT,
    "categories" TEXT[],
    "category_other" TEXT,
    "household_id" UUID,
    "guardian_relationship" TEXT,
    "referral_source" TEXT,
    "consent_date" DATE NOT NULL,
    "consent_method" TEXT NOT NULL,
    "child_assent" TEXT,
    "case_officer_id" TEXT,
    "education_status" TEXT,
    "priority_score" INTEGER,
    "accessibility_needs" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."assessment" (
    "id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "status" "app"."AssessmentStatus" NOT NULL DEFAULT 'draft',
    "answers" TEXT NOT NULL,
    "total_score" INTEGER,
    "recommendation" TEXT,
    "safeguarding_flag" BOOLEAN NOT NULL DEFAULT false,
    "assessed_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "submitted_at" TIMESTAMPTZ(3),

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."selection_decision" (
    "id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "assessment_id" UUID NOT NULL,
    "outcome" "app"."DecisionOutcome" NOT NULL,
    "reason" TEXT NOT NULL,
    "score_at_decision" INTEGER,
    "is_override" BOOLEAN NOT NULL DEFAULT false,
    "decided_by" TEXT NOT NULL,
    "decided_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "selection_decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."status_change" (
    "id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "from_status" "app"."BeneficiaryStatus",
    "to_status" "app"."BeneficiaryStatus" NOT NULL,
    "details" TEXT,
    "changed_by" TEXT NOT NULL,
    "changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."case_note" (
    "id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "kind" "app"."CaseNoteKind" NOT NULL,
    "body" TEXT NOT NULL,
    "occurred_on" DATE NOT NULL,
    "next_review_on" DATE,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."programme" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app"."programme_enrolment" (
    "beneficiary_id" UUID NOT NULL,
    "programme_id" UUID NOT NULL,
    "enrolled_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enrolled_by" TEXT NOT NULL,

    CONSTRAINT "programme_enrolment_pkey" PRIMARY KEY ("beneficiary_id","programme_id")
);

-- CreateTable
CREATE TABLE "app"."assistance_record" (
    "id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "value_pesewas" INTEGER,
    "funding_source" TEXT,
    "status" "app"."AssistanceStatus" NOT NULL DEFAULT 'requested',
    "approved_on" DATE,
    "provided_on" DATE,
    "authorized_by" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" TEXT,

    CONSTRAINT "assistance_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "household_number_key" ON "app"."household"("number");

-- CreateIndex
CREATE UNIQUE INDEX "household_code_key" ON "app"."household"("code");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_number_key" ON "app"."beneficiary"("number");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiary_code_key" ON "app"."beneficiary"("code");

-- CreateIndex
CREATE INDEX "beneficiary_status_idx" ON "app"."beneficiary"("status");

-- CreateIndex
CREATE INDEX "beneficiary_region_idx" ON "app"."beneficiary"("region");

-- CreateIndex
CREATE INDEX "beneficiary_household_id_idx" ON "app"."beneficiary"("household_id");

-- CreateIndex
CREATE INDEX "assessment_beneficiary_id_created_at_idx" ON "app"."assessment"("beneficiary_id", "created_at");

-- CreateIndex
CREATE INDEX "selection_decision_beneficiary_id_decided_at_idx" ON "app"."selection_decision"("beneficiary_id", "decided_at");

-- CreateIndex
CREATE INDEX "status_change_beneficiary_id_changed_at_idx" ON "app"."status_change"("beneficiary_id", "changed_at");

-- CreateIndex
CREATE INDEX "case_note_beneficiary_id_occurred_on_idx" ON "app"."case_note"("beneficiary_id", "occurred_on");

-- CreateIndex
CREATE UNIQUE INDEX "programme_name_key" ON "app"."programme"("name");

-- CreateIndex
CREATE INDEX "programme_enrolment_programme_id_idx" ON "app"."programme_enrolment"("programme_id");

-- CreateIndex
CREATE INDEX "assistance_record_beneficiary_id_idx" ON "app"."assistance_record"("beneficiary_id");

-- AddForeignKey
ALTER TABLE "app"."beneficiary_access" ADD CONSTRAINT "beneficiary_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."beneficiary" ADD CONSTRAINT "beneficiary_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "app"."household"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."assessment" ADD CONSTRAINT "assessment_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "app"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."selection_decision" ADD CONSTRAINT "selection_decision_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "app"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."status_change" ADD CONSTRAINT "status_change_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "app"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."case_note" ADD CONSTRAINT "case_note_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "app"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."programme_enrolment" ADD CONSTRAINT "programme_enrolment_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "app"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."programme_enrolment" ADD CONSTRAINT "programme_enrolment_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "app"."programme"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app"."assistance_record" ADD CONSTRAINT "assistance_record_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "app"."beneficiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The initial programme categories from the BMS requirements (module 7). Approvers can rename, add or deactivate them.
INSERT INTO "app"."programme" ("id", "name", "updated_at") VALUES
    (gen_random_uuid(), 'Education Access and Scholarship Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Literacy and Numeracy Development Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Digital Skills and ICT Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'STEM and Innovation Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Inclusive Education Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Vocational and Skills Development Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Career Development and Mentorship Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Agricultural and Environmental Education Programme', CURRENT_TIMESTAMP),
    (gen_random_uuid(), 'Community Learning Programme', CURRENT_TIMESTAMP);
