import { SignOutButton } from "@/components/auth";
import type { UserRole } from "@/lib/types/roles";

interface DashboardHeaderProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    role?: UserRole;
  };
  role: UserRole;
}

const roleBadgeColors: Record<UserRole, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  INSTRUCTOR: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  LEARNER: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
};

export function DashboardHeader({ user, role }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${roleBadgeColors[role]}`}
          >
            {role}
          </span>
        </div>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {user.name || user.email}
        </p>
      </div>
      <SignOutButton className="text-sm text-zinc-600 hover:text-zinc-500 dark:text-zinc-400 dark:hover:text-zinc-300">
        Sign out
      </SignOutButton>
    </div>
  );
}

