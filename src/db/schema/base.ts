import { uuid, timestamp } from "drizzle-orm/pg-core";

export const id = uuid("id").primaryKey().defaultRandom();
export const createdAt = timestamp("created_at").defaultNow().notNull();

