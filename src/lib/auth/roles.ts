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

/**
 * Check if a user has a specific role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    ADMIN: 3,
    INSTRUCTOR: 2,
    LEARNER: 1,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

export function isInstructor(role: UserRole): boolean {
  return role === "INSTRUCTOR";
}

export function isLearner(role: UserRole): boolean {
  return role === "LEARNER";
}

