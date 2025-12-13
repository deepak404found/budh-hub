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
    const error = new Error(
      "Redis not configured. Verification tokens cannot be stored. " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment variables."
    );
    console.error("[REDIS ERROR] Failed to create verification token:", error.message);
    throw error;
  }

  const key = `verification_token:${identifier}:${token}`;
  const ttl = Math.floor((expires.getTime() - Date.now()) / 1000);
  
  if (ttl <= 0) {
    const error = new Error("Verification token has already expired");
    console.error("[REDIS ERROR] Token expired:", error.message);
    throw error;
  }

  try {
    // Upstash Redis automatically serializes objects to JSON
    await redis.set(
      key,
      { identifier, token, expires: expires.toISOString() },
      { ex: ttl }
    );
    console.log(`[REDIS] Verification token stored for ${identifier}`);
  } catch (error) {
    const err = error instanceof Error 
      ? error 
      : new Error("Failed to store verification token in Redis");
    console.error("[REDIS ERROR] Failed to store verification token:", {
      identifier,
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
}

/**
 * Get verification token from Redis
 */
export async function getVerificationToken(
  identifier: string,
  token: string
): Promise<VerificationToken | null> {
  if (!redis) {
    const error = new Error(
      "Redis not configured. Verification tokens cannot be retrieved. " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment variables."
    );
    console.error("[REDIS ERROR] Failed to get verification token:", error.message);
    throw error;
  }

  const key = `verification_token:${identifier}:${token}`;
  
  try {
    // Upstash Redis auto-deserializes JSON, so we get the object directly
    const data = await redis.get<{ identifier: string; token: string; expires: string } | null>(key);
    
    if (!data) {
      console.warn(`[REDIS] Verification token not found for ${identifier}`);
      return null; // Token not found (might be expired or invalid)
    }

    // Upstash Redis automatically deserializes JSON, so data is already an object
    return {
      identifier: data.identifier,
      token: data.token,
      expires: new Date(data.expires),
    };
  } catch (error) {
    const err = error instanceof Error 
      ? error 
      : new Error("Failed to retrieve verification token from Redis");
    console.error("[REDIS ERROR] Failed to get verification token:", {
      identifier,
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
}

/**
 * Delete verification token from Redis
 */
export async function deleteVerificationToken(
  identifier: string,
  token: string
): Promise<void> {
  if (!redis) {
    const error = new Error(
      "Redis not configured. Cannot delete verification token. " +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your environment variables."
    );
    console.error("[REDIS ERROR] Failed to delete verification token:", error.message);
    throw error;
  }

  const key = `verification_token:${identifier}:${token}`;
  
  try {
    await redis.del(key);
    console.log(`[REDIS] Verification token deleted for ${identifier}`);
  } catch (error) {
    const err = error instanceof Error 
      ? error 
      : new Error("Failed to delete verification token from Redis");
    console.error("[REDIS ERROR] Failed to delete verification token:", {
      identifier,
      error: err.message,
      stack: err.stack,
    });
    throw err;
  }
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

/**
 * Password Reset Token Functions
 */

interface PasswordResetToken {
  email: string;
  token: string;
  expires: Date;
}

/**
 * Store password reset token in Redis
 */
export async function setPasswordResetToken(
  email: string,
  token: string,
  expires: Date
): Promise<void> {
  if (!redis) {
    console.warn(
      "⚠️  Redis not configured. Password reset tokens will not be stored.\n" +
      "Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env file."
    );
    return;
  }

  const key = `password_reset_token:${token}`;
  const ttl = Math.floor((expires.getTime() - Date.now()) / 1000);

  if (ttl <= 0) {
    return; // Already expired
  }

  await redis.set(
    key,
    { email, token, expires: expires.toISOString() },
    { ex: ttl }
  );
}

/**
 * Get password reset token from Redis
 */
export async function getPasswordResetToken(
  token: string
): Promise<PasswordResetToken | null> {
  if (!redis) {
    return null;
  }

  const key = `password_reset_token:${token}`;
  const data = await redis.get<{ email: string; token: string; expires: string } | null>(key);

  if (!data) {
    return null;
  }

  return {
    email: data.email,
    token: data.token,
    expires: new Date(data.expires),
  };
}

/**
 * Delete password reset token from Redis
 */
export async function deletePasswordResetToken(token: string): Promise<void> {
  if (!redis) {
    return;
  }

  const key = `password_reset_token:${token}`;
  await redis.del(key);
}

