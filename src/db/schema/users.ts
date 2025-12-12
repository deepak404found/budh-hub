import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";

// Users table - compatible with NextAuth adapter requirements
// Note: We use text for id to match NextAuth expectations, but keep our custom fields
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }), // Nullable - set during onboarding
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  password_hash: varchar("password_hash", { length: 512 }),
  role: varchar("role", { length: 50 }).notNull().default("LEARNER"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

