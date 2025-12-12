import { pgTable, varchar } from "drizzle-orm/pg-core";
import { id, createdAt } from "./base";

export const users = pgTable("users", {
  id,
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 512 }),
  role: varchar("role", { length: 50 }).notNull().default("LEARNER"),
  created_at: createdAt
});

