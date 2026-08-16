ALTER TABLE "generation_runs" DROP CONSTRAINT IF EXISTS "generation_runs_template_id_resume_templates_id_fk";
ALTER TABLE "generation_runs" ALTER COLUMN "template_id" TYPE text USING "template_id"::text;
