import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";

/**
 * Dashboard layout - uses AuthenticatedLayout for consistent styling
 * and authentication handling across all dashboard pages
 * Includes navigation sidebar for easy navigation
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get user for sidebar role - middleware already handles auth
  const user = await getCurrentUserWithRole();
  const userRole = (user?.role || "LEARNER") as "ADMIN" | "INSTRUCTOR" | "LEARNER";

  // If no user, return null (middleware should have caught this)
  if (!user) {
    return null;
  }

  return (
    <AuthenticatedLayout
      title="Dashboard"
      description="Welcome to your dashboard"
      showRoleBadge={true}
      showSignOut={true}
      sidebar={<NavigationSidebar role={userRole} />}
    >
      {children}
    </AuthenticatedLayout>
  );
}

