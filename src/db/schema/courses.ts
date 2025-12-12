import { pgTable, varchar, text, boolean } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const courses = pgTable("courses", {
  id,
  instructor_id: id, // will be FK in migrations/queries
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  difficulty: varchar("difficulty", { length: 50 }),
  thumbnail_url: varchar("thumbnail_url", { length: 1024 }),
  is_published: boolean("is_published").default(false),
  created_at: createdAt
});

