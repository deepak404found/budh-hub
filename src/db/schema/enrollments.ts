import { pgTable, integer, timestamp, text } from "drizzle-orm/pg-core";
import { id } from "./base";

export const enrollments = pgTable("enrollments", {
  id,
  course_id: text("course_id").notNull(), // FK to courses.id (UUID)
  learner_id: text("learner_id").notNull(), // FK to users.id (text)
  enrolled_at: timestamp("enrolled_at").defaultNow().notNull(),
  progress: integer("progress").default(0)
});

