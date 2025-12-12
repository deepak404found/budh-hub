import { db } from "@/db";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";
import type { UserRole } from "@/lib/types/roles";

/**
 * Get user role from database by user ID
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    const userResults = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userResults.length === 0) {
      return null;
    }

    const role = userResults[0].role as UserRole;
    return role || "LEARNER"; // Default to LEARNER if null
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}

/**
 * Get user role from database by email
 */
export async function getUserRoleByEmail(email: string): Promise<UserRole | null> {
  try {
    const userResults = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResults.length === 0) {
      return null;
    }

    const role = userResults[0].role as UserRole;
    return role || "LEARNER"; // Default to LEARNER if null
  } catch (error) {
    console.error("Error fetching user role by email:", error);
    return null;
  }
}

