import { pgTable, varchar, timestamp, json, text } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const live_classes = pgTable("live_classes", {
  id,
  course_id: text("course_id").notNull(), // FK to courses.id (UUID)
  instructor_id: text("instructor_id").notNull(), // FK to users.id (text)
  title: varchar("title", { length: 512 }).notNull(),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  google_event_id: varchar("google_event_id", { length: 512 }),
  meet_link: varchar("meet_link", { length: 1024 }),
  attendees: json("attendees"),
  created_at: createdAt
});

