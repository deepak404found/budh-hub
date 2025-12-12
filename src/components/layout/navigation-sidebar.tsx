"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types/roles";
import { HomeIcon, BookOpenIcon, UsersIcon, SettingsIcon, ChartBarIcon } from "lucide-react";

interface NavigationSidebarProps {
  role: UserRole;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navigationItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: HomeIcon,
    roles: ["ADMIN", "INSTRUCTOR", "LEARNER"],
  },
  {
    href: "/courses",
    label: "Courses",
    icon: BookOpenIcon,
    roles: ["ADMIN", "INSTRUCTOR", "LEARNER"],
  },
  {
    href: "/my-courses",
    label: "My Learning",
    icon: BookOpenIcon,
    roles: ["LEARNER"],
  },
  {
    href: "/instructor/students",
    label: "My Students",
    icon: UsersIcon,
    roles: ["INSTRUCTOR"],
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: UsersIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/courses",
    label: "All Courses",
    icon: BookOpenIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/admin/analytics",
    label: "Analytics",
    icon: ChartBarIcon,
    roles: ["ADMIN"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: SettingsIcon,
    roles: ["ADMIN", "INSTRUCTOR", "LEARNER"],
  },
];

/**
 * NavigationSidebar - Role-based navigation sidebar
 * Filters navigation items based on user role
 */
export function NavigationSidebar({ role }: NavigationSidebarProps) {
  const pathname = usePathname();

  const filteredItems = navigationItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <nav className="space-y-1">
      {filteredItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href as any}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

