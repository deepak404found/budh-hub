import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as usersSchema from "./schema/users";
import * as coursesSchema from "./schema/courses";
import * as modulesSchema from "./schema/modules";
import * as lessonsSchema from "./schema/lessons";
import * as enrollmentsSchema from "./schema/enrollments";
import * as lessonProgressSchema from "./schema/lesson_progress";
import * as quizzesSchema from "./schema/quizzes";
import * as quizQuestionsSchema from "./schema/quiz_questions";
import * as quizAttemptsSchema from "./schema/quiz_attempts";
import * as liveClassesSchema from "./schema/live_classes";
import * as courseMaterialsSchema from "./schema/course_materials";
// ai_cache removed - now using Redis via @/lib/redis
import * as authSchema from "./schema/auth";

const schema = {
  ...usersSchema,
  ...coursesSchema,
  ...modulesSchema,
  ...lessonsSchema,
  ...enrollmentsSchema,
  ...lessonProgressSchema,
  ...quizzesSchema,
  ...quizQuestionsSchema,
  ...quizAttemptsSchema,
  ...liveClassesSchema,
  ...courseMaterialsSchema,
  // aiCacheSchema removed - using Redis instead
  ...authSchema,
};

import { dbConfig } from "@/lib/config/env";

if (!dbConfig.url) {
  throw new Error("DATABASE_URL is required. Please set it in your .env file.");
}

// Configure connection pool with proper limits and error handling
const pool = new Pool({
  connectionString: dbConfig.url,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  // Handle connection errors
  allowExitOnIdle: false, // Don't exit process when pool is idle
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
  // Don't exit the process, let the application handle it
});

// Handle connection errors
pool.on("connect", (client) => {
  client.on("error", (err) => {
    console.error("Database client error:", err);
  });
});

export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
