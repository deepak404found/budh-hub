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
  // aiCacheSchema removed - using Redis instead
  ...authSchema,
};

import { dbConfig } from "@/lib/config/env";

if (!dbConfig.url) {
  throw new Error("DATABASE_URL is required. Please set it in your .env file.");
}

const pool = new Pool({ connectionString: dbConfig.url });
export const db: NodePgDatabase<typeof schema> = drizzle(pool, { schema });
