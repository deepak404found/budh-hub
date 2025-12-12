import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { CourseDetailsPageClient } from "@/components/courses/course-details-page-client";

/**
 * Course Details Page
 * Shows course information and allows enrollment
 */
export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const user = await getCurrentUserWithRole();
  if (!user) {
    return null; // Middleware should handle redirect
  }

  return (
    <AuthenticatedLayout
      title="Course Details"
      sidebar={<NavigationSidebar role={user.role} />}
    >
      <CourseDetailsPageClient
        courseId={courseId}
        userId={user.id || ""}
        userRole={user.role}
      />
    </AuthenticatedLayout>
  );
}

