import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { id } from "./base";

export const enrollments = pgTable("enrollments", {
  id,
  course_id: id,
  learner_id: id,
  enrolled_at: timestamp("enrolled_at").defaultNow().notNull(),
  progress: integer("progress").default(0)
});

