import { redis } from "./client";

export type CacheType = "summary" | "quiz";

interface CacheResult {
  type: CacheType;
  result: unknown;
  createdAt: string;
}

/**
 * Get AI cache for a lesson
 * @param lessonId - The lesson UUID
 * @param type - Cache type ('summary' or 'quiz')
 * @returns Cached result or null if not found
 */
export async function getAICache(
  lessonId: string,
  type: CacheType
): Promise<unknown | null> {
  if (!redis) {
    return null;
  }

  try {
    const key = `ai_cache:${lessonId}:${type}`;
    const cached = await redis.get<CacheResult>(key);
    return cached?.result ?? null;
  } catch (error) {
    console.error("Error getting AI cache from Redis:", error);
    return null;
  }
}

/**
 * Set AI cache for a lesson
 * @param lessonId - The lesson UUID
 * @param type - Cache type ('summary' or 'quiz')
 * @param result - The result to cache
 * @param ttl - Time to live in seconds (default: 7 days)
 */
export async function setAICache(
  lessonId: string,
  type: CacheType,
  result: unknown,
  ttl: number = 60 * 60 * 24 * 7 // 7 days default
): Promise<void> {
  if (!redis) {
    console.warn("Redis not available, cache not saved");
    return;
  }

  try {
    const key = `ai_cache:${lessonId}:${type}`;
    const value: CacheResult = {
      type,
      result,
      createdAt: new Date().toISOString(),
    };
    await redis.set(key, value, { ex: ttl });
  } catch (error) {
    console.error("Error setting AI cache in Redis:", error);
  }
}

/**
 * Delete AI cache for a lesson
 * @param lessonId - The lesson UUID
 * @param type - Optional cache type. If not provided, deletes all cache for the lesson
 */
export async function deleteAICache(
  lessonId: string,
  type?: CacheType
): Promise<void> {
  if (!redis) {
    return;
  }

  try {
    if (type) {
      const key = `ai_cache:${lessonId}:${type}`;
      await redis.del(key);
    } else {
      // Delete all cache for this lesson
      const summaryKey = `ai_cache:${lessonId}:summary`;
      const quizKey = `ai_cache:${lessonId}:quiz`;
      await redis.del(summaryKey, quizKey);
    }
  } catch (error) {
    console.error("Error deleting AI cache from Redis:", error);
  }
}

/**
 * Check if cache exists for a lesson
 * @param lessonId - The lesson UUID
 * @param type - Cache type ('summary' or 'quiz')
 */
export async function hasAICache(
  lessonId: string,
  type: CacheType
): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    const key = `ai_cache:${lessonId}:${type}`;
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error("Error checking AI cache in Redis:", error);
    return false;
  }
}

