import { pgTable, varchar, text, integer } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

/**
 * Course Materials Schema
 * Stores study materials (PDFs, images, documents) metadata
 * Materials can be course-level or lesson-specific
 */
export const course_materials = pgTable("course_materials", {
  id,
  course_id: text("course_id").notNull(), // FK to courses.id (UUID)
  lesson_id: text("lesson_id"), // FK to lessons.id (UUID), nullable for course-level materials
  file_name: varchar("file_name", { length: 512 }).notNull(),
  file_key: varchar("file_key", { length: 1024 }).notNull(), // R2 object key
  file_type: varchar("file_type", { length: 100 }), // MIME type
  file_size: integer("file_size"), // Size in bytes
  material_type: varchar("material_type", { length: 50 }), // 'image', 'document', 'pdf', etc.
  created_at: createdAt,
});

