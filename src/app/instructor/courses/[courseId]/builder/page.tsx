import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { CourseBuilder } from "@/components/courses/course-builder";

/**
 * Course Builder Page
 * Allows instructors to manage modules and lessons for their course
 */
export default async function CourseBuilderPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUserWithRole();
  if (!user || !user.id) {
    return null; // Middleware should handle redirect
  }

  return (
    <AuthenticatedLayout
      title="Course Builder"
      description="Manage your course content"
      sidebar={<NavigationSidebar role={user.role} />}
    >
      <CourseBuilder courseId={courseId} userId={user.id} />
    </AuthenticatedLayout>
  );
}

