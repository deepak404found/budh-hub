import { pgTable, varchar, json } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const ai_cache = pgTable("ai_cache", {
  id,
  lesson_id: id,
  type: varchar("type", { length: 64 }).notNull(), // 'summary'|'quiz'
  result: json("result").notNull(),
  created_at: createdAt
});

