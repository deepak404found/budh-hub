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
        console.error("Error creating verification token in Redis:", error);
        // Fallback: return data even if Redis fails (for development)
        // In production, you might want to throw the error
        return data;
      }
    },

    async useVerificationToken(params: {
      identifier: string;
      token: string;
    }) {
      try {
        const token = await getVerificationToken(params.identifier, params.token);
        if (!token) {
          return null;
        }
        
        // Delete the token after use (one-time use)
        await deleteVerificationToken(params.identifier, params.token);
        
        return {
          identifier: token.identifier,
          token: token.token,
          expires: token.expires,
        };
      } catch (error) {
        console.error("Error using verification token from Redis:", error);
        return null;
      }
    },
  };
}

