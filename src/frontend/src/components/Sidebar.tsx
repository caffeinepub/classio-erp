import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Megaphone,
  Settings,
  UserCog,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { UserProfile } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useCallerRole } from "../hooks/useQueries";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  section?: string;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users, section: "Academic" },
  {
    id: "teachers",
    label: "Teachers",
    icon: GraduationCap,
    section: "Academic",
  },
  { id: "classes", label: "Classes", icon: Building2, section: "Academic" },
  {
    id: "attendance",
    label: "Attendance",
    icon: Calendar,
    section: "Academic",
  },
  { id: "grades", label: "Grades", icon: BarChart3, section: "Academic" },
  {
    id: "announcements",
    label: "Announcements",
    icon: Megaphone,
    section: "Communication",
  },
  { id: "staff", label: "Staff", icon: UserCog, section: "HR Management" },
  {
    id: "departments",
    label: "Departments",
    icon: Building2,
    section: "HR Management",
  },
  {
    id: "leave-requests",
    label: "Leave Requests",
    icon: FileText,
    section: "HR Management",
  },
  {
    id: "payroll",
    label: "Payroll",
    icon: DollarSign,
    section: "HR Management",
  },
  { id: "courses", label: "Courses", icon: Library, section: "LMS" },
  {
    id: "submissions",
    label: "Submissions",
    icon: ClipboardList,
    section: "LMS",
  },
  {
    id: "user-management",
    label: "User Management",
    icon: BookOpen,
    section: "Administration",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    section: "Administration",
  },
];

const sections = [
  "Academic",
  "Communication",
  "HR Management",
  "LMS",
  "Administration",
];

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  userProfile: UserProfile | null;
};

function NavSection({
  title,
  items,
  activePage,
  onNavigate,
  collapsed,
  onToggle,
  userRole,
}: {
  title: string;
  items: NavItem[];
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  userRole: string | null;
}) {
  // Filter admin-only items
  const visibleItems = items.filter((item) => {
    if (item.id === "user-management") return userRole === "admin";
    return true;
  });

  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
      >
        <span>{title}</span>
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>
      {!collapsed && (
        <div className="space-y-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.id}
              item={item}
              active={activePage === item.id}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: (page: string) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      data-ocid={`nav.${item.id}.link`}
      onClick={() => onNavigate(item.id)}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-150",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
    </button>
  );
}

export default function Sidebar({
  activePage,
  onNavigate,
  userProfile,
}: SidebarProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: roleData } = useCallerRole();

  const userRole = typeof roleData === "string" ? roleData : null;

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const topNavItems = navItems.filter((item) => !item.section);
  const sectionedItems = sections.map((section) => ({
    title: section,
    items: navItems.filter((item) => item.section === section),
  }));

  return (
    <aside className="flex flex-col h-full bg-sidebar w-64 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="bg-primary/20 rounded-xl p-2 shrink-0">
          <img
            src="/assets/generated/classio-logo-transparent.dim_120x120.png"
            alt="Classio ERP"
            className="w-8 h-8 object-contain"
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-sidebar-foreground font-display font-bold text-base leading-tight">
            Classio ERP
          </h1>
          <p className="text-sidebar-foreground/40 text-xs">
            School Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {/* Top-level items */}
        {topNavItems.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={activePage === item.id}
            onNavigate={onNavigate}
          />
        ))}

        <div className="my-2 border-t border-sidebar-border" />

        {/* Sections */}
        {sectionedItems.map(({ title, items }) => (
          <NavSection
            key={title}
            title={title}
            items={items}
            activePage={activePage}
            onNavigate={onNavigate}
            collapsed={!!collapsedSections[title]}
            onToggle={() => toggleSection(title)}
            userRole={userRole}
          />
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center shrink-0">
            <span className="text-sidebar-foreground text-sm font-semibold">
              {userProfile?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">
              {userProfile?.name ?? "User"}
            </p>
            <p className="text-sidebar-foreground/40 text-xs capitalize">
              {userRole ?? userProfile?.role ?? "user"}
            </p>
          </div>
          <button
            type="button"
            data-ocid="nav.logout.button"
            onClick={handleLogout}
            className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
