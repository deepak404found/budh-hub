import { getCurrentUserWithRole } from "@/lib/auth/server";
import { SignOutButton } from "@/components/auth";
import type { UserRole } from "@/lib/types/roles";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  /**
   * Optional custom header component
   * If not provided, uses default header with user info
   */
  header?: React.ReactNode;
  /**
   * Optional sidebar component
   */
  sidebar?: React.ReactNode;
  /**
   * Optional custom title
   */
  title?: string;
  /**
   * Optional custom description
   */
  description?: string;
  /**
   * Show role badge in header
   * @default true
   */
  showRoleBadge?: boolean;
  /**
   * Show sign out button in header
   * @default true
   */
  showSignOut?: boolean;
  /**
   * Custom container max width
   * @default "max-w-6xl"
   */
  maxWidth?: string;
}

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  INSTRUCTOR: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  LEARNER: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
};

/**
 * AuthenticatedLayout - Shared layout for all authenticated pages
 * 
 * Features:
 * - Automatic authentication check
 * - User info display
 * - Role badge
 * - Sign out button
 * - Consistent styling
 * - Customizable header and sidebar
 */
export async function AuthenticatedLayout({
  children,
  header,
  sidebar,
  title,
  description,
  showRoleBadge = true,
  showSignOut = true,
  maxWidth = "max-w-6xl",
}: AuthenticatedLayoutProps) {
  // Get authenticated user with role
  // Note: Middleware already handles authentication, so we don't redirect here
  // If user is not found, we'll show a loading/error state instead
  const user = await getCurrentUserWithRole();

  // If no user, return null (middleware should have caught this, but handle gracefully)
  if (!user || !user.id) {
    // Don't redirect here - middleware handles it
    // Return a loading state or null to prevent render
    return null;
  }

  const userRole = user.role || "LEARNER";

  // Default header if not provided
  const defaultHeader = (
    <div className="mb-8 flex items-center justify-between">
      <div>
        {title && (
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {title}
            </h1>
            {showRoleBadge && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeColors[userRole as UserRole]}`}
              >
                {userRole}
              </span>
            )}
          </div>
        )}
        {description && (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">{description}</p>
        )}
        {!title && (
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {user.name || user.email}
            </p>
          </div>
        )}
      </div>
      {showSignOut && (
        <SignOutButton className="text-sm text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300">
          Sign out
        </SignOutButton>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-12 dark:bg-zinc-900 sm:px-6 lg:px-8">
      <div className={`mx-auto ${maxWidth}`}>
        {sidebar ? (
          <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
            <aside className="hidden lg:block">{sidebar}</aside>
            <main className="min-w-0">
              {header || defaultHeader}
              {children}
            </main>
          </div>
        ) : (
          <>
            {header || defaultHeader}
            {children}
          </>
        )}
      </div>
    </div>
  );
}

