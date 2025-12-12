import { pgTable, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const live_classes = pgTable("live_classes", {
  id,
  course_id: id,
  instructor_id: id,
  title: varchar("title", { length: 512 }).notNull(),
  start_time: timestamp("start_time"),
  end_time: timestamp("end_time"),
  google_event_id: varchar("google_event_id", { length: 512 }),
  meet_link: varchar("meet_link", { length: 1024 }),
  attendees: json("attendees"),
  created_at: createdAt
});

