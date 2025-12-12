import { pgTable, boolean } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const lesson_progress = pgTable("lesson_progress", {
  id,
  enrollment_id: id,
  lesson_id: id,
  completed: boolean("completed").default(false),
  created_at: createdAt
});

