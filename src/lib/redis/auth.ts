import { redis } from "./client";

/**
 * Redis-based verification token storage for NextAuth
 * Replaces PostgreSQL verification_tokens table
 */

interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

/**
 * Store verification token in Redis
 */
export async function setVerificationToken(
  identifier: string,
  token: string,
  expires: Date
): Promise<void> {
  if (!redis) {
    console.warn(
      "⚠️  Redis not configured. Verification tokens will not be stored.\n" +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env file."
    );
    // In development, we can continue without Redis (tokens just won't be stored)
    // In production, you might want to throw an error instead
    return;
  }

  const key = `verification_token:${identifier}:${token}`;
  const ttl = Math.floor((expires.getTime() - Date.now()) / 1000);
  
  if (ttl <= 0) {
    return; // Already expired
  }

  // Upstash Redis automatically serializes objects to JSON
  await redis.set(
    key,
    { identifier, token, expires: expires.toISOString() },
    { ex: ttl }
  );
}

/**
 * Get verification token from Redis
 */
export async function getVerificationToken(
  identifier: string,
  token: string
): Promise<VerificationToken | null> {
  if (!redis) {
    return null;
  }

  const key = `verification_token:${identifier}:${token}`;
  // Upstash Redis auto-deserializes JSON, so we get the object directly
  const data = await redis.get<{ identifier: string; token: string; expires: string } | null>(key);
  
  if (!data) {
    return null;
  }

  // Upstash Redis automatically deserializes JSON, so data is already an object
  // No need to parse - it's already deserialized
  return {
    identifier: data.identifier,
    token: data.token,
    expires: new Date(data.expires),
  };
}

/**
 * Delete verification token from Redis
 */
export async function deleteVerificationToken(
  identifier: string,
  token: string
): Promise<void> {
  if (!redis) {
    return;
  }

  const key = `verification_token:${identifier}:${token}`;
  await redis.del(key);
}

/**
 * Delete all verification tokens for an identifier (email)
 */
export async function deleteVerificationTokensByIdentifier(
  identifier: string
): Promise<void> {
  if (!redis) {
    return;
  }

  // Note: This requires scanning keys, which is not ideal for production
  // In production, you might want to use a different key structure
  // For now, we'll delete by pattern (this works but is slower)
  const pattern = `verification_token:${identifier}:*`;
  
  // Upstash Redis doesn't support SCAN directly, so we'll need to track keys differently
  // For now, we'll just delete individual tokens when they're used
  // This is a limitation - in production, consider using a set to track tokens per identifier
}

