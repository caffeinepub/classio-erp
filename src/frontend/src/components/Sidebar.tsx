import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Building2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Megaphone,
  Receipt,
  Settings,
  ShieldCheck,
  TrendingDown,
  UserCog,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  section?: string;
};

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "admissions",
    label: "Admissions",
    icon: UserPlus,
    section: "Admissions",
  },
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
    id: "fee-structures",
    label: "Fee Structures",
    icon: Receipt,
    section: "Finance",
  },
  { id: "invoices", label: "Invoices", icon: FileText, section: "Finance" },
  { id: "payments", label: "Payments", icon: CreditCard, section: "Finance" },
  { id: "expenses", label: "Expenses", icon: TrendingDown, section: "Finance" },
  {
    id: "financial-report",
    label: "P&L Report",
    icon: BarChart3,
    section: "Finance",
  },
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
    icon: CreditCard,
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
    label: "Teacher Accounts",
    icon: BookOpen,
    section: "Administration",
  },
  {
    id: "documents",
    label: "Documents",
    icon: FileText,
    section: "Administration",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    section: "Administration",
  },
  {
    id: "school-admins",
    label: "School Admins",
    icon: ShieldCheck,
    section: "Super Admin",
  },
  {
    id: "my-leave-requests",
    label: "My Leave Requests",
    icon: FileText,
    section: "My Account",
  },
  {
    id: "my-attendance",
    label: "My Attendance",
    icon: Calendar,
    section: "My Account",
  },
  {
    id: "salary-slip",
    label: "Salary Slip",
    icon: Wallet,
    section: "My Account",
  },
];

const sections = [
  "Admissions",
  "Academic",
  "Finance",
  "Communication",
  "HR Management",
  "LMS",
  "Administration",
  "Super Admin",
  "My Account",
];

type SidebarProps = {
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

function NavSection({
  title,
  items,
  activePage,
  onNavigate,
  collapsed,
  onToggle,
  userRole,
  sidebarCollapsed,
}: {
  title: string;
  items: NavItem[];
  activePage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  userRole: string | null;
  sidebarCollapsed: boolean;
}) {
  const adminRoles = ["superadmin", "admin", "schooladmin"];
  const hrRoles = ["superadmin", "admin", "schooladmin", "hr"];
  const schoolAdminRoles = ["superadmin", "admin", "schooladmin", "hr"];

  const isSectionVisible = () => {
    switch (title) {
      case "Super Admin":
        return userRole === "admin" || userRole === "superadmin";
      case "Admissions":
      case "Finance":
        return hrRoles.includes(userRole ?? "");
      case "Academic":
        return schoolAdminRoles.includes(userRole ?? "");
      case "HR Management":
        return hrRoles.includes(userRole ?? "");
      case "Administration":
        return schoolAdminRoles.includes(userRole ?? "");
      case "My Account":
        return userRole === "teacher";
      default:
        return true;
    }
  };

  if (!isSectionVisible()) return null;

  const visibleItems = items.filter((item) => {
    if (item.id === "user-management")
      return adminRoles.includes(userRole ?? "");
    if (userRole === "teacher") {
      if (
        ["staff", "departments", "payroll", "leave-requests"].includes(item.id)
      )
        return false;
    }
    return true;
  });

  if (visibleItems.length === 0) return null;

  if (sidebarCollapsed) {
    return (
      <div className="mb-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={activePage === item.id}
            onNavigate={onNavigate}
            sidebarCollapsed={sidebarCollapsed}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
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
              sidebarCollapsed={false}
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
  sidebarCollapsed,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: (page: string) => void;
  sidebarCollapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      data-ocid={`nav.${item.id}.link`}
      onClick={() => onNavigate(item.id)}
      title={sidebarCollapsed ? item.label : undefined}
      className={cn(
        "w-full flex items-center gap-3 rounded-md text-sm font-medium transition-all duration-150",
        sidebarCollapsed ? "justify-center px-0 py-2" : "px-3 py-2",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
    </button>
  );
}

export default function Sidebar({
  activePage,
  onNavigate,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { user, logout } = useLocalAuth();
  const userRole = user?.role ?? null;
  const schoolLogo =
    localStorage.getItem("classio_school_logo") ||
    "/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg";

  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const topNavItems = navItems.filter((item) => {
    if (!item.section) {
      if (userRole === "teacher") return false;
    }
    return !item.section;
  });

  const sectionedItems = sections.map((section) => ({
    title: section,
    items: navItems.filter((item) => item.section === section),
  }));

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-sidebar shrink-0 border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-14" : "w-64",
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-3 py-5 border-b border-sidebar-border relative",
          collapsed ? "px-2 justify-center" : "px-4",
        )}
      >
        <div className="bg-primary/10 rounded-xl p-1 shrink-0">
          <img
            src={schoolLogo}
            alt="Classio ERP"
            className="w-9 h-9 rounded-lg object-cover"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h1 className="text-sidebar-foreground font-display font-bold text-base leading-tight">
              Classio ERP
            </h1>
            <p className="text-sidebar-foreground/60 text-xs">
              School Management
            </p>
          </div>
        )}
        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center justify-center w-5 h-5 rounded-full bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors",
            collapsed
              ? "absolute -right-2.5 top-1/2 -translate-y-1/2 shadow border border-sidebar-border z-10"
              : "shrink-0",
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {topNavItems.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={activePage === item.id}
            onNavigate={onNavigate}
            sidebarCollapsed={collapsed}
          />
        ))}

        {topNavItems.length > 0 && (
          <div className="my-2 border-t border-sidebar-border" />
        )}

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
            sidebarCollapsed={collapsed}
          />
        ))}

        {userRole === "teacher" && (
          <div className="mt-1">
            <NavLink
              item={{ id: "settings", label: "Settings", icon: Settings }}
              active={activePage === "settings"}
              onNavigate={onNavigate}
              sidebarCollapsed={collapsed}
            />
          </div>
        )}
      </nav>

      {/* User info + Logout */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <button
              type="button"
              data-ocid="nav.logout.button"
              onClick={logout}
              title={`Logout (${user?.name ?? "User"})`}
              className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0 text-sidebar-foreground hover:bg-primary/25 transition-colors"
            >
              <span className="text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
              </span>
            </button>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-sidebar-foreground text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sidebar-foreground text-sm font-medium truncate">
                  {user?.name ?? "User"}
                </p>
                <p className="text-sidebar-foreground/60 text-xs capitalize">
                  {userRole ?? "user"}
                </p>
              </div>
              <button
                type="button"
                data-ocid="nav.logout.button"
                onClick={logout}
                className="text-sidebar-foreground/55 hover:text-sidebar-foreground transition-colors p-1"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
