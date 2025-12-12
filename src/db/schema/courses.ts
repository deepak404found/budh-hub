import { pgTable, varchar, text, boolean, integer, numeric } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const courses = pgTable("courses", {
  id,
  instructor_id: text("instructor_id").notNull(), // FK to users.id (text)
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  difficulty: varchar("difficulty", { length: 50 }),
  thumbnail_url: varchar("thumbnail_url", { length: 1024 }),
  price: numeric("price", { precision: 10, scale: 2 }), // For future monetization
  estimated_duration: integer("estimated_duration"), // Total course duration in minutes
  total_lessons: integer("total_lessons").default(0), // Cached count of lessons
  is_published: boolean("is_published").default(false),
  created_at: createdAt
});

