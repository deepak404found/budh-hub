import { pgTable, text, integer } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const quiz_questions = pgTable("quiz_questions", {
  id,
  quiz_id: text("quiz_id").notNull(), // FK to quizzes.id (UUID)
  question_text: text("question_text").notNull(),
  options: text("options").notNull(), // store JSON string of options
  answer_index: integer("answer_index").notNull(),
  created_at: createdAt
});

