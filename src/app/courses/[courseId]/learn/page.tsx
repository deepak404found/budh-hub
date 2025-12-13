import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { CourseLearningPageClient } from "@/components/courses/course-learning-page-client";

/**
 * Course Learning Page
 * Where learners watch lessons and track progress
 */
export default async function CourseLearningPage({
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
      title="Learning"
      sidebar={<NavigationSidebar role={user.role} />}
    >
      <CourseLearningPageClient courseId={courseId} userId={user.id} />
    </AuthenticatedLayout>
  );
}


