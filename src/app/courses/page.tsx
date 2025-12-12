import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { CoursesCatalog } from "@/components/courses/courses-catalog";

/**
 * Course Catalog Page
 * Displays all published courses for learners to browse
 */
export default async function CoursesPage() {
  const user = await getCurrentUserWithRole();
  if (!user) {
    return null; // Middleware should handle redirect
  }

  return (
    <AuthenticatedLayout
      title="Browse Courses"
      description="Discover courses to enhance your learning"
      sidebar={<NavigationSidebar role={user.role} />}
    >
      <CoursesCatalog />
    </AuthenticatedLayout>
  );
}

