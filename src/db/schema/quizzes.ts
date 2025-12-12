import { pgTable, varchar, text } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const quizzes = pgTable("quizzes", {
  id,
  course_id: text("course_id").notNull(), // FK to courses.id (UUID)
  title: varchar("title", { length: 512 }).notNull(),
  created_at: createdAt
});

