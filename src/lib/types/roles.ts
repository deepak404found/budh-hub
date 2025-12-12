/**
 * User role types in the system
 * Hierarchy: ADMIN > INSTRUCTOR > LEARNER
 */
export type UserRole = "ADMIN" | "INSTRUCTOR" | "LEARNER";

/**
 * Role hierarchy levels (higher number = more permissions)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 3,
  INSTRUCTOR: 2,
  LEARNER: 1,
};

/**
 * Check if a role has permission based on hierarchy
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is admin
 */
export function isAdmin(role: UserRole): boolean {
  return role === "ADMIN";
}

/**
 * Check if user is instructor or admin
 */
export function isInstructorOrAbove(role: UserRole): boolean {
  return role === "INSTRUCTOR" || role === "ADMIN";
}

/**
 * Check if user is instructor
 */
export function isInstructor(role: UserRole): boolean {
  return role === "INSTRUCTOR";
}

/**
 * Check if user is learner
 */
export function isLearner(role: UserRole): boolean {
  return role === "LEARNER";
}

