import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { accounts } from "@/db/schema/auth";
import {
  setVerificationToken,
  getVerificationToken,
  deleteVerificationToken,
} from "@/lib/redis/auth";

/**
 * Custom NextAuth adapter that uses:
 * - PostgreSQL (via Drizzle) for users and accounts
 * - Redis for verification tokens (expiring data)
 * 
 * Since we're using JWT sessions, we don't need the sessions table
 */
export function createRedisAdapter() {
  const drizzleAdapter = DrizzleAdapter(db, {
    usersTable: users as any,
    accountsTable: accounts,
    // sessionsTable: undefined, // Using JWT, not database sessions
    // verificationTokensTable: undefined, // Using Redis instead
  });

  // Override verification token methods to use Redis
  return {
    ...drizzleAdapter,
    
    async createVerificationToken(data: {
      identifier: string;
      token: string;
      expires: Date;
    }) {
      try {
        await setVerificationToken(data.identifier, data.token, data.expires);
        return data;
      } catch (error) {
        const err = error instanceof Error 
          ? error 
          : new Error("Failed to create verification token");
        console.error("[AUTH ERROR] Failed to create verification token in Redis:", {
          identifier: data.identifier,
          error: err.message,
          stack: err.stack,
        });
        // Throw error - no fallback to database
        throw err;
      }
    },

    async useVerificationToken(params: {
      identifier: string;
      token: string;
    }) {
      try {
        const token = await getVerificationToken(params.identifier, params.token);
        if (!token) {
          // Token not found - this is expected for invalid/expired tokens
          console.warn(`[AUTH] Verification token not found for ${params.identifier}`);
          return null;
        }
        
        // Delete the token after use (one-time use)
        try {
          await deleteVerificationToken(params.identifier, params.token);
        } catch (deleteError) {
          // Log but don't fail - token was already retrieved
          console.error("[AUTH WARNING] Failed to delete verification token after use:", deleteError);
        }
        
        return {
          identifier: token.identifier,
          token: token.token,
          expires: token.expires,
        };
      } catch (error) {
        const err = error instanceof Error 
          ? error 
          : new Error("Failed to verify token");
        console.error("[AUTH ERROR] Failed to use verification token from Redis:", {
          identifier: params.identifier,
          error: err.message,
          stack: err.stack,
        });
        // Throw error - no fallback to database
        throw err;
      }
    },
  };
}

