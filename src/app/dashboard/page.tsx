import { getCurrentUserWithRole } from "@/lib/auth/server";
import {
  AdminDashboard,
  InstructorDashboard,
  LearnerDashboard,
} from "@/components/dashboard";
import type { UserRole } from "@/lib/types/roles";

export default async function DashboardPage() {
  // Get user with role - AuthenticatedLayout handles authentication
  const user = await getCurrentUserWithRole();

  if (!user || !user.id) {
    // This should not happen if AuthenticatedLayout is working correctly
    // But we handle it gracefully
    return null;
  }

  const userRole = user.role || "LEARNER";
  const userId = user.id;

  // Render role-specific dashboard
  const renderDashboard = () => {
    switch (userRole as UserRole) {
      case "ADMIN":
        return <AdminDashboard />;
      case "INSTRUCTOR":
        return <InstructorDashboard userId={userId} />;
      case "LEARNER":
      default:
        return <LearnerDashboard userId={userId} />;
    }
  };

  return <div className="space-y-8">{renderDashboard()}</div>;
}
