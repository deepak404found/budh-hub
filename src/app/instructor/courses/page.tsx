import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { InstructorCoursesList } from "@/components/courses/instructor-courses-list";

/**
 * Instructor Courses List Page
 * Displays all courses created by the current instructor
 */
export default async function InstructorCoursesPage() {
  const user = await getCurrentUserWithRole();
  if (!user || !user.id) {
    return null; // Middleware should handle redirect
  }

  return (
    <AuthenticatedLayout
      title="My Courses"
      description="Manage your courses and content"
      sidebar={<NavigationSidebar role={user.role} />}
    >
      <InstructorCoursesList />
    </AuthenticatedLayout>
  );
}
