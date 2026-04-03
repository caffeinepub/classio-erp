import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Building2,
  Calendar,
  FileText,
  GraduationCap,
  IndianRupee,
  Library,
  Loader2,
  UserCog,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState, PageHeader, StatsCard } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import {
  useAllAnnouncements,
  useAllApplicants,
  useDashboardStats,
  useTotalFeesCollected,
} from "../hooks/useQueries";
import { formatINR } from "../utils/currencyUtils";
import { bigIntToDateString } from "../utils/dateUtils";

function getRoleLabel(role: string | null): string {
  if (!role) return "User";
  const map: Record<string, string> = {
    superadmin: "Super Admin",
    schooladmin: "School Admin",
    teacher: "Teacher",
    hr: "HR Manager",
    student: "Student",
    admin: "Admin",
    user: "User",
  };
  return map[role] ?? role;
}

const teacherFeatureCards = [
  {
    icon: Wallet,
    title: "Salary Slip",
    description: "View and download your salary slip",
    buttonLabel: "View Salary Slip",
    page: "salary-slip",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    borderAccent: "border-t-4 border-t-teal-400",
    ocid: "teacher.salary_slip.primary_button",
  },
  {
    icon: FileText,
    title: "My Leave Requests",
    description: "Submit and track your leave applications",
    buttonLabel: "Manage Leave",
    page: "my-leave-requests",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderAccent: "border-t-4 border-t-blue-400",
    ocid: "teacher.leave.primary_button",
  },
  {
    icon: Calendar,
    title: "My Attendance",
    description: "Mark and view your attendance records",
    buttonLabel: "My Attendance",
    page: "my-attendance",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    borderAccent: "border-t-4 border-t-orange-400",
    ocid: "teacher.attendance.primary_button",
  },
];

function TeacherDashboard({
  onNavigate,
  user,
  roleLabel,
}: {
  onNavigate: (page: string) => void;
  user: { name?: string; role?: string } | null;
  roleLabel: string;
}) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8 rounded-xl overflow-hidden relative"
        data-ocid="dashboard.welcome.card"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/90 to-sidebar-primary/40 pointer-events-none" />
        <div className="relative flex items-center gap-5 p-6 border border-sidebar-border/40 rounded-xl">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-sidebar-primary/40 blur-lg scale-110" />
            <img
              src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
              alt="Classio ERP"
              className="relative w-20 h-20 rounded-xl object-cover shadow-lg border-2 border-sidebar-primary/60"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-sidebar-foreground leading-tight">
                Classio ERP
              </h1>
              {user && (
                <Badge
                  className="bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/40 text-xs font-semibold"
                  variant="outline"
                >
                  {roleLabel}
                </Badge>
              )}
            </div>
            <p className="text-sidebar-foreground/60 text-sm mt-1">
              School Management System
            </p>
            <p className="text-sidebar-foreground/40 text-xs mt-0.5">
              Logged in as:{" "}
              <span className="text-sidebar-foreground/70 font-medium">
                {user?.name ?? roleLabel}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* My Dashboard Heading */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold text-foreground">My Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Access your features below.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teacherFeatureCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.page}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.07 }}
            >
              <Card
                className={`shadow-card hover:shadow-lg transition-shadow cursor-pointer h-full ${card.borderAccent}`}
                onClick={() => onNavigate(card.page)}
                data-ocid={`teacher.${card.page}.card`}
              >
                <CardHeader className="pb-3">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg} mb-3`}
                  >
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                  <CardTitle className="text-base font-semibold">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                  <Button
                    data-ocid={card.ocid}
                    className="w-full mt-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(card.page);
                    }}
                  >
                    {card.buttonLabel}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: announcements, isLoading: announcementsLoading } =
    useAllAnnouncements();
  const { data: applicants = [] } = useAllApplicants();
  const { data: totalFeesCollected = BigInt(0) } = useTotalFeesCollected();
  const { user } = useLocalAuth();

  const roleLabel = getRoleLabel(user?.role ?? null);

  // Teacher-specific dashboard
  if (user?.role === "teacher") {
    return (
      <TeacherDashboard
        onNavigate={onNavigate}
        user={user}
        roleLabel={roleLabel}
      />
    );
  }

  // Admin/all other roles — existing dashboard unchanged
  const pendingAdmissions = (applicants as any[]).filter(
    (a: any) => a.status === "pending",
  ).length;

  const quickActions = [
    { label: "Add Student", page: "students", color: "bg-blue-500" },
    { label: "Add Teacher", page: "teachers", color: "bg-green-500" },
    { label: "Take Attendance", page: "attendance", color: "bg-orange-500" },
    {
      label: "Post Announcement",
      page: "announcements",
      color: "bg-purple-500",
    },
    { label: "New Admission", page: "admissions", color: "bg-amber-500" },
    { label: "Fee Structures", page: "fee-structures", color: "bg-teal-500" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Welcome Banner with Logo */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 rounded-xl overflow-hidden relative"
        data-ocid="dashboard.welcome.card"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-sidebar/90 to-sidebar-primary/40 pointer-events-none" />
        <div className="relative flex items-center gap-5 p-6 border border-sidebar-border/40 rounded-xl">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-sidebar-primary/40 blur-lg scale-110" />
            <img
              src="/assets/classio_logo_reel_compressed-019d539f-bf78-7716-bf0d-bb064308b5be.jpeg"
              alt="Classio ERP"
              className="relative w-20 h-20 rounded-xl object-cover shadow-lg border-2 border-sidebar-primary/60"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-sidebar-foreground leading-tight">
                Classio ERP
              </h1>
              {user && (
                <Badge
                  className="bg-sidebar-primary/20 text-sidebar-primary border border-sidebar-primary/40 text-xs font-semibold"
                  variant="outline"
                >
                  {roleLabel}
                </Badge>
              )}
            </div>
            <p className="text-sidebar-foreground/60 text-sm mt-1">
              School Management System
            </p>
            <p className="text-sidebar-foreground/40 text-xs mt-0.5">
              Logged in as:{" "}
              <span className="text-sidebar-foreground/70 font-medium">
                {user?.name ?? roleLabel}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your school."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <StatsCard
            title="Total Students"
            value={stats ? Number(stats.totalStudents) : "—"}
            icon={Users}
            color="blue"
            isLoading={statsLoading}
          />
        </motion.div>
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatsCard
            title="Teachers"
            value={stats ? Number(stats.totalTeachers) : "—"}
            icon={GraduationCap}
            color="green"
            isLoading={statsLoading}
          />
        </motion.div>
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard
            title="Classes"
            value={stats ? Number(stats.totalClasses) : "—"}
            icon={Building2}
            color="orange"
            isLoading={statsLoading}
          />
        </motion.div>
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatsCard
            title="Staff Members"
            value={stats ? Number(stats.totalStaff) : "—"}
            icon={UserCog}
            color="purple"
            isLoading={statsLoading}
          />
        </motion.div>
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatsCard
            title="LMS Courses"
            value={stats ? Number(stats.totalCourses) : "—"}
            icon={Library}
            color="red"
            isLoading={statsLoading}
          />
        </motion.div>
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatsCard
            title="Pending Admissions"
            value={pendingAdmissions}
            icon={UserPlus}
            color="orange"
            isLoading={false}
          />
        </motion.div>
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatsCard
            title="Fees Collected"
            value={formatINR(totalFeesCollected)}
            icon={IndianRupee}
            color="green"
            isLoading={false}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements */}
        <div className="lg:col-span-2">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Recent Announcements
              </CardTitle>
              <button
                type="button"
                data-ocid="dashboard.announcements.link"
                onClick={() => onNavigate("announcements")}
                className="text-xs text-primary hover:underline"
              >
                View all
              </button>
            </CardHeader>
            <CardContent>
              {announcementsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !announcements || announcements.length === 0 ? (
                <EmptyState
                  title="No announcements yet"
                  description="Announcements posted by your school will appear here."
                  ocid="dashboard.announcements.empty_state"
                />
              ) : (
                <div className="space-y-3">
                  {[...announcements]
                    .sort((a, b) => Number(b.timestamp - a.timestamp))
                    .slice(0, 5)
                    .map((a, i) => (
                      <div
                        key={a.id}
                        data-ocid={`dashboard.announcement.item.${i + 1}`}
                        className="border border-border rounded-lg p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-foreground">
                            {a.title}
                          </h4>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {bigIntToDateString(a.timestamp)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {a.body}
                        </p>
                        <p className="text-xs text-primary mt-1">
                          — {a.authorName}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    type="button"
                    key={action.page}
                    data-ocid={`dashboard.${action.page}.primary_button`}
                    onClick={() => onNavigate(action.page)}
                    className={`${action.color} text-white rounded-lg p-3 text-xs font-medium text-center hover:opacity-90 transition-opacity`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
