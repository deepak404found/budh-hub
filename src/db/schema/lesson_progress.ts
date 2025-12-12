import { pgTable, boolean, text } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const lesson_progress = pgTable("lesson_progress", {
  id,
  enrollment_id: text("enrollment_id").notNull(), // FK to enrollments.id (UUID)
  lesson_id: text("lesson_id").notNull(), // FK to lessons.id (UUID)
  completed: boolean("completed").default(false),
  created_at: createdAt
});

