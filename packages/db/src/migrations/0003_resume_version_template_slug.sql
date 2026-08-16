ALTER TABLE "resume_versions" DROP CONSTRAINT IF EXISTS "resume_versions_template_id_resume_templates_id_fk";
ALTER TABLE "resume_versions" ALTER COLUMN "template_id" TYPE text USING "template_id"::text;
