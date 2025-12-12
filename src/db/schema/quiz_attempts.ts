import { pgTable, integer, text } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const quiz_attempts = pgTable("quiz_attempts", {
  id,
  quiz_id: text("quiz_id").notNull(), // FK to quizzes.id (UUID)
  learner_id: text("learner_id").notNull(), // FK to users.id (text)
  score: integer("score").default(0),
  started_at: createdAt,
  finished_at: createdAt
});

