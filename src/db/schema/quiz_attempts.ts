import { pgTable, integer } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const quiz_attempts = pgTable("quiz_attempts", {
  id,
  quiz_id: id,
  learner_id: id,
  score: integer("score").default(0),
  started_at: createdAt,
  finished_at: createdAt
});

