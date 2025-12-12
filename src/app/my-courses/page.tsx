import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { MyCoursesList } from "@/components/courses/my-courses-list";

/**
 * My Courses Page
 * Displays all courses the learner is enrolled in
 */
export default async function MyCoursesPage() {
  const user = await getCurrentUserWithRole();
  if (!user || !user.id) {
    return null; // Middleware should handle redirect
  }

  return (
    <AuthenticatedLayout
      title="My Learning"
      description="Continue your learning journey"
      sidebar={<NavigationSidebar role={user.role} />}
    >
      <MyCoursesList />
    </AuthenticatedLayout>
  );
}

