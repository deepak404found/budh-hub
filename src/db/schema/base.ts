import { serial, timestamp } from "drizzle-orm/pg-core";

export const id = serial("id").primaryKey();
export const createdAt = timestamp("created_at").defaultNow().notNull();

