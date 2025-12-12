import { pgTable, text, integer } from "drizzle-orm/pg-core";

// NextAuth required tables for Email provider
// Note: verificationTokens and sessions moved to Redis (expiring data)
// - verificationTokens: Stored in Redis with TTL (see @/lib/redis/auth)
// - sessions: Not needed (using JWT strategy)

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

// Sessions table removed - using JWT strategy, not database sessions
// If you need database sessions in the future, add it back

// VerificationTokens table removed - now using Redis via @/lib/redis/auth
// This is better for expiring data with TTL support

