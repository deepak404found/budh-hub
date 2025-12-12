import { auth } from "@/lib/auth/nextauth";
import { getUserRole } from "./roles";
import type { UserRole } from "@/lib/types/roles";

export async function getSession() {
  // NextAuth v5 beta uses auth() instead of getServerSession
  return await auth();
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Get current user with role from database
 * This ensures we always have the latest role from the database
 */
export async function getCurrentUserWithRole() {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  const role = await getUserRole(session.user.id);
  return {
    ...session.user,
    role: (role || "LEARNER") as UserRole,
  };
}

/**
 * Get user role from session or database
 */
export async function getUserRoleFromSession(): Promise<UserRole | null> {
  const session = await getSession();
  if (!session?.user?.id) {
    return null;
  }

  // First try to get from session (faster)
  const userWithRole = session.user as any;
  if (userWithRole.role) {
    return userWithRole.role as UserRole;
  }

  // Fallback to database
  return await getUserRole(session.user.id);
}

