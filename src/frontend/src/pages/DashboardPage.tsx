import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Building2,
  GraduationCap,
  Library,
  Loader2,
  UserCog,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { EmptyState, PageHeader, StatsCard } from "../components/shared";
import { useAllAnnouncements, useDashboardStats } from "../hooks/useQueries";
import { bigIntToDateString } from "../utils/dateUtils";

export default function DashboardPage({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: announcements, isLoading: announcementsLoading } =
    useAllAnnouncements();

  const quickActions = [
    { label: "Add Student", page: "students", color: "bg-blue-500" },
    { label: "Add Teacher", page: "teachers", color: "bg-green-500" },
    { label: "Take Attendance", page: "attendance", color: "bg-orange-500" },
    {
      label: "Post Announcement",
      page: "announcements",
      color: "bg-purple-500",
    },
    { label: "Add Course", page: "courses", color: "bg-teal-500" },
    { label: "Manage Staff", page: "staff", color: "bg-indigo-500" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your school."
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <motion.div
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
