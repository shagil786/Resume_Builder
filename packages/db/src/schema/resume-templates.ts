import { pgTable, uuid, text, timestamp, pgEnum, boolean, jsonb } from 'drizzle-orm/pg-core';

export const templateCategory = pgEnum('template_category', ['PROFESSIONAL', 'CREATIVE', 'MINIMAL', 'ACADEMIC']);

export const resumeTemplates = pgTable('resume_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  slug: text('slug').notNull().unique(),
  schemaVersion: text('schema_version').notNull(),
  templateSchema: jsonb('template_schema').notNull(),
  previewImageUrl: text('preview_image_url'),
  category: templateCategory('category').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
});
