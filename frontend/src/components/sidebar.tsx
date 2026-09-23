"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar, ClipboardList, Home, LogOut, Settings, Stethoscope,
  Users, Building2, LayoutGrid, Clock, UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

const roleNavItems: Record<string, { label: string; href: string; icon: React.ElementType }[]> = {
  ORGANIZATION_ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Doctors", href: "/doctors", icon: Stethoscope },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Branches", href: "/branches", icon: Building2 },
    { label: "Departments", href: "/departments", icon: LayoutGrid },
    { label: "Schedules", href: "/schedules", icon: Clock },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
  DOCTOR: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Schedule", href: "/schedules", icon: Clock },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ],
  RECEPTIONIST: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Patients", href: "/patients", icon: Users },
    { label: "Doctors", href: "/doctors", icon: Stethoscope },
    { label: "Schedules", href: "/schedules", icon: Clock },
  ],
  STAFF: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Appointments", href: "/appointments", icon: Calendar },
    { label: "Patients", href: "/patients", icon: Users },
  ],
  PATIENT: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Book Appointment", href: "/book", icon: ClipboardList },
    { label: "My Appointments", href: "/appointments", icon: Calendar },
    { label: "Find Doctors", href: "/doctors", icon: Stethoscope },
    { label: "Profile", href: "/profile", icon: UserCircle },
  ],
  SUPER_ADMIN: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Organizations", href: "/organizations", icon: Building2 },
    { label: "Users", href: "/users", icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, currentOrg, logout } = useAuth();
  const role = currentOrg?.role || "PATIENT";
  const items = roleNavItems[role] || roleNavItems.PATIENT;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-6 py-5">
        <h1 className="text-xl font-bold text-blue-600">DoctorDjango</h1>
        {currentOrg && (
          <p className="mt-1 truncate text-xs text-gray-500">{currentOrg.organization_name}</p>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-100 px-3 py-4">
        <div className="mb-3 px-3">
          <p className="truncate text-sm font-medium text-gray-900">{user?.full_name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
