import { pgTable, varchar } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const quizzes = pgTable("quizzes", {
  id,
  course_id: id,
  title: varchar("title", { length: 512 }).notNull(),
  created_at: createdAt
});

