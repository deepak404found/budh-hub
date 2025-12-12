import { pgTable, varchar, integer, text } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const modules = pgTable("modules", {
  id,
  course_id: text("course_id").notNull(), // FK to courses.id (UUID)
  title: varchar("title", { length: 512 }).notNull(),
  ord: integer("ord").default(0),
  created_at: createdAt
});

