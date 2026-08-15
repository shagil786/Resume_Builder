CREATE TYPE "public"."document_status" AS ENUM('PENDING_PROCESSING', 'PROCESSED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."extraction_method" AS ENUM('PDF_PARSER', 'DOCX_PARSER', 'OCR', 'USER_INPUT');--> statement-breakpoint
CREATE TYPE "public"."fact_category" AS ENUM('WORK', 'SKILL', 'PROJECT', 'EDUCATION', 'CERTIFICATION', 'ACHIEVEMENT');--> statement-breakpoint
CREATE TYPE "public"."fact_status" AS ENUM('EXTRACTED', 'USER_PROVIDED', 'VERIFIED', 'REJECTED', 'NEEDS_REVIEW');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."job_source" AS ENUM('TEXT_INPUT', 'JOB_URL', 'API_IMPORT');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('ANALYZED', 'FAILED_ANALYSIS');--> statement-breakpoint
CREATE TYPE "public"."profile_status" AS ENUM('DRAFT', 'FINALIZED');--> statement-breakpoint
CREATE TYPE "public"."requirement_category" AS ENUM('TECHNICAL', 'EXPERIENCE', 'SKILL', 'EDUCATION', 'SOFT');--> statement-breakpoint
CREATE TYPE "public"."requirement_type" AS ENUM('HARD', 'SOFT', 'NICE_TO_HAVE');--> statement-breakpoint
CREATE TYPE "public"."resume_version_status" AS ENUM('DRAFT', 'GENERATED', 'FINALIZED', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."skill_proficiency" AS ENUM('ENTRY', 'JUNIOR', 'INTERMEDIATE', 'SENIOR', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('PROFESSIONAL', 'CREATIVE', 'MINIMAL', 'ACADEMIC');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('PRIVATE', 'PUBLIC_LINK');--> statement-breakpoint
CREATE TABLE "candidate_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"source_ref" text NOT NULL,
	"source_location" jsonb,
	"claim" text NOT NULL,
	"context" text NOT NULL,
	"confidence" real NOT NULL,
	"status" "fact_status" DEFAULT 'EXTRACTED' NOT NULL,
	"category" "fact_category" NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"verification_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidate_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"personal_info" jsonb NOT NULL,
	"summary" text,
	"visibility" "visibility" DEFAULT 'PRIVATE' NOT NULL,
	"status" "profile_status" DEFAULT 'DRAFT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"archived_at" timestamp with time zone,
	"latest_processed_at" timestamp with time zone,
	CONSTRAINT "candidate_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "certifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"issuing_organization" text NOT NULL,
	"issue_date" date NOT NULL,
	"expiry_date" date,
	"credential_id" text,
	"credential_url" text,
	"fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "education_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"institution" text NOT NULL,
	"degree" text NOT NULL,
	"field_of_study" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"gpa" real,
	"fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "experience_bullets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"experience_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"text" text NOT NULL,
	"fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_references" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fact_provenance" (
	"fact_id" uuid PRIMARY KEY NOT NULL,
	"source_id" text NOT NULL,
	"extraction_method" "extraction_method" NOT NULL,
	"human_verified" boolean DEFAULT false NOT NULL,
	"verification_notes" text,
	"confidence_at_extraction" real NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"job_id" uuid,
	"template_id" uuid NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"status" "generation_status" DEFAULT 'PENDING' NOT NULL,
	"stages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"errors" jsonb
);
--> statement-breakpoint
CREATE TABLE "job_requirements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"type" "requirement_type" NOT NULL,
	"category" "requirement_category" NOT NULL,
	"text" text NOT NULL,
	"original_text" text NOT NULL,
	"weight" real NOT NULL,
	"matched_fact_ids" text[],
	"coverage_score" real
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"source" "job_source" NOT NULL,
	"source_url" text,
	"raw_text" text NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"url" text,
	"extracted_at" timestamp with time zone,
	"status" "job_status" DEFAULT 'FAILED_ANALYSIS' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_bullets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"text" text NOT NULL,
	"fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"source_references" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"url" text,
	"github_url" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resume_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"slug" text NOT NULL,
	"schema_version" text NOT NULL,
	"template_schema" jsonb NOT NULL,
	"preview_image_url" text,
	"category" "template_category" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "resume_templates_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "resume_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"job_id" uuid,
	"version_number" integer NOT NULL,
	"structured_data" jsonb NOT NULL,
	"status" "resume_version_status" DEFAULT 'DRAFT' NOT NULL,
	"generation_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"storage_path" text,
	"pdf_checksum" text
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"years_of_experience" real,
	"proficiency" "skill_proficiency",
	"fact_id" uuid,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "source_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"mimetype" text NOT NULL,
	"size" bigint NOT NULL,
	"upload_date" timestamp with time zone DEFAULT now() NOT NULL,
	"storage_path" text,
	"status" "document_status" DEFAULT 'PENDING_PROCESSING' NOT NULL,
	"processing_error" text,
	"extracted_at" timestamp with time zone,
	"checksum" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"tenant_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	"preferences" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "work_experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"company" text NOT NULL,
	"title" text NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"location" text,
	"fact_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_facts" ADD CONSTRAINT "candidate_facts_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_entries" ADD CONSTRAINT "education_entries_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_bullets" ADD CONSTRAINT "experience_bullets_experience_id_work_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."work_experiences"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fact_provenance" ADD CONSTRAINT "fact_provenance_fact_id_candidate_facts_id_fk" FOREIGN KEY ("fact_id") REFERENCES "public"."candidate_facts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_runs" ADD CONSTRAINT "generation_runs_template_id_resume_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."resume_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_requirements" ADD CONSTRAINT "job_requirements_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_bullets" ADD CONSTRAINT "project_bullets_project_id_project_entries_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_entries" ADD CONSTRAINT "project_entries_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_template_id_resume_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."resume_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_versions" ADD CONSTRAINT "resume_versions_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_documents" ADD CONSTRAINT "source_documents_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_experiences" ADD CONSTRAINT "work_experiences_profile_id_candidate_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");