import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const modules = pgTable("modules", {
  id,
  course_id: id,
  title: varchar("title", { length: 512 }).notNull(),
  ord: integer("ord").default(0),
  created_at: createdAt
});

