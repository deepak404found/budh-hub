export * from "./schema/users";
export * from "./schema/courses";
export * from "./schema/modules";
export * from "./schema/lessons";
export * from "./schema/enrollments";
export * from "./schema/lesson_progress";
export * from "./schema/quizzes";
export * from "./schema/quiz_questions";
export * from "./schema/quiz_attempts";
export * from "./schema/live_classes";
// ai_cache removed - now using Redis via @/lib/redis
export * from "./schema/auth";
export { db } from "./client";

