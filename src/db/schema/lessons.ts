import { pgTable, varchar, text, integer } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const lessons = pgTable("lessons", {
  id,
  module_id: id,
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content"), // markdown/html
  video_key: varchar("video_key", { length: 1024 }), // R2 object key
  ord: integer("ord").default(0),
  created_at: createdAt
});

