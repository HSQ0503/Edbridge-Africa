import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Payload creates its schema only in push mode, so the first migration creates it.
  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "cms";`)
  await db.execute(sql`
   CREATE TYPE "cms"."enum_news_type" AS ENUM('news', 'event', 'publication');
  CREATE TYPE "cms"."enum_news_review_state" AS ENUM('draft', 'in_review', 'changes_requested', 'approved');
  CREATE TYPE "cms"."enum_news_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__news_v_version_type" AS ENUM('news', 'event', 'publication');
  CREATE TYPE "cms"."enum__news_v_version_review_state" AS ENUM('draft', 'in_review', 'changes_requested', 'approved');
  CREATE TYPE "cms"."enum__news_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_people_group" AS ENUM('board', 'executive');
  CREATE TYPE "cms"."enum_people_review_state" AS ENUM('draft', 'in_review', 'changes_requested', 'approved');
  CREATE TYPE "cms"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__people_v_version_group" AS ENUM('board', 'executive');
  CREATE TYPE "cms"."enum__people_v_version_review_state" AS ENUM('draft', 'in_review', 'changes_requested', 'approved');
  CREATE TYPE "cms"."enum__people_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_jobs_employment_type" AS ENUM('full-time', 'part-time', 'contract', 'internship');
  CREATE TYPE "cms"."enum_jobs_review_state" AS ENUM('draft', 'in_review', 'changes_requested', 'approved');
  CREATE TYPE "cms"."enum_jobs_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum__jobs_v_version_employment_type" AS ENUM('full-time', 'part-time', 'contract', 'internship');
  CREATE TYPE "cms"."enum__jobs_v_version_review_state" AS ENUM('draft', 'in_review', 'changes_requested', 'approved');
  CREATE TYPE "cms"."enum__jobs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "cms"."enum_media_consent_scopes" AS ENUM('web', 'social', 'print', 'donor_reports');
  CREATE TYPE "cms"."enum_users_roles" AS ENUM('writer', 'publisher', 'safeguarding_reviewer');
  CREATE TABLE "cms"."news" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"type" "cms"."enum_news_type" DEFAULT 'news',
  	"date" timestamp(3) with time zone,
  	"summary" varchar,
  	"image_id" integer,
  	"event_venue" varchar,
  	"event_accessibility" varchar,
  	"body" jsonb,
  	"slug" varchar,
  	"review_state" "cms"."enum_news_review_state" DEFAULT 'draft',
  	"review_note" varchar,
  	"features_child" boolean,
  	"safeguarding_approved" boolean,
  	"safeguarding_approved_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_news_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_news_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_type" "cms"."enum__news_v_version_type" DEFAULT 'news',
  	"version_date" timestamp(3) with time zone,
  	"version_summary" varchar,
  	"version_image_id" integer,
  	"version_event_venue" varchar,
  	"version_event_accessibility" varchar,
  	"version_body" jsonb,
  	"version_slug" varchar,
  	"version_review_state" "cms"."enum__news_v_version_review_state" DEFAULT 'draft',
  	"version_review_note" varchar,
  	"version_features_child" boolean,
  	"version_safeguarding_approved" boolean,
  	"version_safeguarding_approved_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__news_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" varchar,
  	"name" varchar,
  	"group" "cms"."enum_people_group",
  	"bio" varchar,
  	"photo_id" integer,
  	"order" numeric DEFAULT 100,
  	"review_state" "cms"."enum_people_review_state" DEFAULT 'draft',
  	"review_note" varchar,
  	"features_child" boolean,
  	"safeguarding_approved" boolean,
  	"safeguarding_approved_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_people_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_people_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_role" varchar,
  	"version_name" varchar,
  	"version_group" "cms"."enum__people_v_version_group",
  	"version_bio" varchar,
  	"version_photo_id" integer,
  	"version_order" numeric DEFAULT 100,
  	"version_review_state" "cms"."enum__people_v_version_review_state" DEFAULT 'draft',
  	"version_review_note" varchar,
  	"version_features_child" boolean,
  	"version_safeguarding_approved" boolean,
  	"version_safeguarding_approved_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__people_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"department" varchar,
  	"location" varchar,
  	"employment_type" "cms"."enum_jobs_employment_type",
  	"closing_date" timestamp(3) with time zone,
  	"summary" varchar,
  	"description" jsonb,
  	"involves_children" boolean,
  	"slug" varchar,
  	"review_state" "cms"."enum_jobs_review_state" DEFAULT 'draft',
  	"review_note" varchar,
  	"features_child" boolean,
  	"safeguarding_approved" boolean,
  	"safeguarding_approved_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "cms"."enum_jobs_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "cms"."_jobs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_department" varchar,
  	"version_location" varchar,
  	"version_employment_type" "cms"."enum__jobs_v_version_employment_type",
  	"version_closing_date" timestamp(3) with time zone,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_involves_children" boolean,
  	"version_slug" varchar,
  	"version_review_state" "cms"."enum__jobs_v_version_review_state" DEFAULT 'draft',
  	"version_review_note" varchar,
  	"version_features_child" boolean,
  	"version_safeguarding_approved" boolean,
  	"version_safeguarding_approved_hash" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "cms"."enum__jobs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "cms"."media_consent_scopes" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms"."enum_media_consent_scopes",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cms"."media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar,
  	"decorative" boolean,
  	"identifiable_child" boolean,
  	"consent_reference" varchar,
  	"consent_expires" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar
  );
  
  CREATE TABLE "cms"."users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "cms"."enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cms"."users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"portal_user_id" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"news_id" integer,
  	"people_id" integer,
  	"jobs_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "cms"."payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "cms"."payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "cms"."site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"whatsapp" varchar,
  	"address" varchar NOT NULL,
  	"ghana_post_gps" varchar,
  	"hours" varchar DEFAULT 'Monday to Friday, 8:30am – 5:00pm (GMT)' NOT NULL,
  	"emergency_numbers" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "cms"."_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_email" varchar NOT NULL,
  	"version_phone" varchar NOT NULL,
  	"version_whatsapp" varchar,
  	"version_address" varchar NOT NULL,
  	"version_ghana_post_gps" varchar,
  	"version_hours" varchar DEFAULT 'Monday to Friday, 8:30am – 5:00pm (GMT)' NOT NULL,
  	"version_emergency_numbers" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "cms"."news" ADD CONSTRAINT "news_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_news_v" ADD CONSTRAINT "_news_v_parent_id_news_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."news"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_news_v" ADD CONSTRAINT "_news_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_people_v" ADD CONSTRAINT "_people_v_parent_id_people_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_people_v" ADD CONSTRAINT "_people_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "cms"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."_jobs_v" ADD CONSTRAINT "_jobs_v_parent_id_jobs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."jobs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cms"."media_consent_scopes" ADD CONSTRAINT "media_consent_scopes_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_news_fk" FOREIGN KEY ("news_id") REFERENCES "cms"."news"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "cms"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "cms"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "cms"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "cms"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cms"."payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "cms"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "news_image_idx" ON "cms"."news" USING btree ("image_id");
  CREATE UNIQUE INDEX "news_slug_idx" ON "cms"."news" USING btree ("slug");
  CREATE INDEX "news_updated_at_idx" ON "cms"."news" USING btree ("updated_at");
  CREATE INDEX "news_created_at_idx" ON "cms"."news" USING btree ("created_at");
  CREATE INDEX "news__status_idx" ON "cms"."news" USING btree ("_status");
  CREATE INDEX "_news_v_parent_idx" ON "cms"."_news_v" USING btree ("parent_id");
  CREATE INDEX "_news_v_version_version_image_idx" ON "cms"."_news_v" USING btree ("version_image_id");
  CREATE INDEX "_news_v_version_version_slug_idx" ON "cms"."_news_v" USING btree ("version_slug");
  CREATE INDEX "_news_v_version_version_updated_at_idx" ON "cms"."_news_v" USING btree ("version_updated_at");
  CREATE INDEX "_news_v_version_version_created_at_idx" ON "cms"."_news_v" USING btree ("version_created_at");
  CREATE INDEX "_news_v_version_version__status_idx" ON "cms"."_news_v" USING btree ("version__status");
  CREATE INDEX "_news_v_created_at_idx" ON "cms"."_news_v" USING btree ("created_at");
  CREATE INDEX "_news_v_updated_at_idx" ON "cms"."_news_v" USING btree ("updated_at");
  CREATE INDEX "_news_v_latest_idx" ON "cms"."_news_v" USING btree ("latest");
  CREATE INDEX "people_photo_idx" ON "cms"."people" USING btree ("photo_id");
  CREATE INDEX "people_updated_at_idx" ON "cms"."people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "cms"."people" USING btree ("created_at");
  CREATE INDEX "people__status_idx" ON "cms"."people" USING btree ("_status");
  CREATE INDEX "_people_v_parent_idx" ON "cms"."_people_v" USING btree ("parent_id");
  CREATE INDEX "_people_v_version_version_photo_idx" ON "cms"."_people_v" USING btree ("version_photo_id");
  CREATE INDEX "_people_v_version_version_updated_at_idx" ON "cms"."_people_v" USING btree ("version_updated_at");
  CREATE INDEX "_people_v_version_version_created_at_idx" ON "cms"."_people_v" USING btree ("version_created_at");
  CREATE INDEX "_people_v_version_version__status_idx" ON "cms"."_people_v" USING btree ("version__status");
  CREATE INDEX "_people_v_created_at_idx" ON "cms"."_people_v" USING btree ("created_at");
  CREATE INDEX "_people_v_updated_at_idx" ON "cms"."_people_v" USING btree ("updated_at");
  CREATE INDEX "_people_v_latest_idx" ON "cms"."_people_v" USING btree ("latest");
  CREATE UNIQUE INDEX "jobs_slug_idx" ON "cms"."jobs" USING btree ("slug");
  CREATE INDEX "jobs_updated_at_idx" ON "cms"."jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "cms"."jobs" USING btree ("created_at");
  CREATE INDEX "jobs__status_idx" ON "cms"."jobs" USING btree ("_status");
  CREATE INDEX "_jobs_v_parent_idx" ON "cms"."_jobs_v" USING btree ("parent_id");
  CREATE INDEX "_jobs_v_version_version_slug_idx" ON "cms"."_jobs_v" USING btree ("version_slug");
  CREATE INDEX "_jobs_v_version_version_updated_at_idx" ON "cms"."_jobs_v" USING btree ("version_updated_at");
  CREATE INDEX "_jobs_v_version_version_created_at_idx" ON "cms"."_jobs_v" USING btree ("version_created_at");
  CREATE INDEX "_jobs_v_version_version__status_idx" ON "cms"."_jobs_v" USING btree ("version__status");
  CREATE INDEX "_jobs_v_created_at_idx" ON "cms"."_jobs_v" USING btree ("created_at");
  CREATE INDEX "_jobs_v_updated_at_idx" ON "cms"."_jobs_v" USING btree ("updated_at");
  CREATE INDEX "_jobs_v_latest_idx" ON "cms"."_jobs_v" USING btree ("latest");
  CREATE INDEX "media_consent_scopes_order_idx" ON "cms"."media_consent_scopes" USING btree ("order");
  CREATE INDEX "media_consent_scopes_parent_idx" ON "cms"."media_consent_scopes" USING btree ("parent_id");
  CREATE INDEX "media_updated_at_idx" ON "cms"."media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "cms"."media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "cms"."media" USING btree ("filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "cms"."media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "cms"."media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "users_roles_order_idx" ON "cms"."users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "cms"."users_roles" USING btree ("parent_id");
  CREATE UNIQUE INDEX "users_portal_user_id_idx" ON "cms"."users" USING btree ("portal_user_id");
  CREATE INDEX "users_updated_at_idx" ON "cms"."users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "cms"."users" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "cms"."payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "cms"."payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "cms"."payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "cms"."payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "cms"."payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "cms"."payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "cms"."payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_news_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("news_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("jobs_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "cms"."payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "cms"."payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "cms"."payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "cms"."payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "cms"."payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "cms"."payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "cms"."payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "cms"."payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "cms"."payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "cms"."payload_migrations" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "cms"."_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "cms"."_site_settings_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cms"."news" CASCADE;
  DROP TABLE "cms"."_news_v" CASCADE;
  DROP TABLE "cms"."people" CASCADE;
  DROP TABLE "cms"."_people_v" CASCADE;
  DROP TABLE "cms"."jobs" CASCADE;
  DROP TABLE "cms"."_jobs_v" CASCADE;
  DROP TABLE "cms"."media_consent_scopes" CASCADE;
  DROP TABLE "cms"."media" CASCADE;
  DROP TABLE "cms"."users_roles" CASCADE;
  DROP TABLE "cms"."users" CASCADE;
  DROP TABLE "cms"."payload_kv" CASCADE;
  DROP TABLE "cms"."payload_locked_documents" CASCADE;
  DROP TABLE "cms"."payload_locked_documents_rels" CASCADE;
  DROP TABLE "cms"."payload_preferences" CASCADE;
  DROP TABLE "cms"."payload_preferences_rels" CASCADE;
  DROP TABLE "cms"."payload_migrations" CASCADE;
  DROP TABLE "cms"."site_settings" CASCADE;
  DROP TABLE "cms"."_site_settings_v" CASCADE;
  DROP TYPE "cms"."enum_news_type";
  DROP TYPE "cms"."enum_news_review_state";
  DROP TYPE "cms"."enum_news_status";
  DROP TYPE "cms"."enum__news_v_version_type";
  DROP TYPE "cms"."enum__news_v_version_review_state";
  DROP TYPE "cms"."enum__news_v_version_status";
  DROP TYPE "cms"."enum_people_group";
  DROP TYPE "cms"."enum_people_review_state";
  DROP TYPE "cms"."enum_people_status";
  DROP TYPE "cms"."enum__people_v_version_group";
  DROP TYPE "cms"."enum__people_v_version_review_state";
  DROP TYPE "cms"."enum__people_v_version_status";
  DROP TYPE "cms"."enum_jobs_employment_type";
  DROP TYPE "cms"."enum_jobs_review_state";
  DROP TYPE "cms"."enum_jobs_status";
  DROP TYPE "cms"."enum__jobs_v_version_employment_type";
  DROP TYPE "cms"."enum__jobs_v_version_review_state";
  DROP TYPE "cms"."enum__jobs_v_version_status";
  DROP TYPE "cms"."enum_media_consent_scopes";
  DROP TYPE "cms"."enum_users_roles";`)
}
