import { AuthenticatedLayout } from "@/components/layout";
import { NavigationSidebar } from "@/components/layout/navigation-sidebar";
import { getCurrentUserWithRole } from "@/lib/auth/server";
import { CreateCourseForm } from "@/components/courses/create-course-form";

/**
 * Create New Course Page
 */
export default async function CreateCoursePage() {
  const user = await getCurrentUserWithRole();
  if (!user || !user.id) {
    return null; // Middleware should handle redirect
  }

  return (
    <AuthenticatedLayout
      title="Create New Course"
      description="Start building your course"
      sidebar={<NavigationSidebar role={user.role} />}
    >
      <div className="mx-auto max-w-2xl">
        <CreateCourseForm />
      </div>
    </AuthenticatedLayout>
  );
}

