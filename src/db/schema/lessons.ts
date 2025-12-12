import { pgTable, varchar, text, integer } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const lessons = pgTable("lessons", {
  id,
  module_id: text("module_id").notNull(), // FK to modules.id (UUID)
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content"), // markdown/html
  video_key: varchar("video_key", { length: 1024 }), // R2 object key
  video_size: integer("video_size"), // File size in bytes
  video_duration: integer("video_duration"), // Duration in seconds (optional)
  video_mime_type: varchar("video_mime_type", { length: 100 }), // MIME type (e.g., video/mp4)
  ord: integer("ord").default(0),
  created_at: createdAt
});

