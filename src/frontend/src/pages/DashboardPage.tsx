import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
import { useState } from "react";
import { EmptyState, PageHeader, StatsCard } from "../components/shared";
import { useLocalAuth } from "../hooks/useLocalAuth";
import {
  useAllAnnouncements,
  useAllApplicants,
  useDashboardStats,
  usePendingAttendanceCorrections,
  useSubmitAttendanceCorrection,
  useTotalFeesCollected,
} from "../hooks/useQueries";
import { formatINR } from "../utils/currencyUtils";
import { bigIntToDateString, dateToBigInt } from "../utils/dateUtils";

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

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDateLabel(date: Date): string {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function AttendanceCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const isCurrentMonthOrPast =
    viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth <= today.getMonth());

  const isAtCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (isAtCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  // Build typed cell list: empty slots use their column position as key
  type CalCell = { type: "empty"; col: number } | { type: "day"; day: number };
  const calCells: CalCell[] = [
    ...Array.from(
      { length: firstDay },
      (_, col): CalCell => ({ type: "empty", col }),
    ),
    ...Array.from(
      { length: daysInMonth },
      (_, i): CalCell => ({ type: "day", day: i + 1 }),
    ),
  ];

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
          data-ocid="attendance.calendar.pagination_prev"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          disabled={isAtCurrentMonth}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
          data-ocid="attendance.calendar.pagination_next"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {calCells.map((cell) => {
          if (cell.type === "empty") {
            return (
              <div
                key={`empty-${viewYear}-${viewMonth}-${cell.col}`}
                className="h-9"
              />
            );
          }

          const { day } = cell;
          const cellDate = new Date(viewYear, viewMonth, day);
          const isToday = isSameDay(cellDate, today);
          const isFuture = cellDate > today && !isSameDay(cellDate, today);
          const isSelected = selectedDate
            ? isSameDay(cellDate, selectedDate)
            : false;

          return (
            <div key={day} className="flex items-center justify-center h-9">
              <button
                type="button"
                disabled={isFuture || !isCurrentMonthOrPast}
                onClick={() => !isFuture && onSelect(cellDate)}
                className={[
                  "w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center transition-all",
                  isFuture
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isToday
                        ? "ring-2 ring-primary text-primary font-bold hover:bg-primary/10"
                        : "text-foreground hover:bg-muted cursor-pointer",
                ].join(" ")}
                aria-label={`Select ${formatDateLabel(cellDate)}`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickAttendanceSection({ username }: { username: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState<Date | null>(null);

  const { data: corrections = [], isLoading: correctionsLoading } =
    usePendingAttendanceCorrections();
  const submitMutation = useSubmitAttendanceCorrection();

  const myRequests = (corrections as any[]).filter(
    (c: any) => c.staffId === username,
  );

  function handleSubmit() {
    if (!selectedDate) return;
    submitMutation.mutate(
      {
        staffId: username,
        date: dateToBigInt(selectedDate),
        requestedStatus: "Present",
        reason: notes.trim(),
      },
      {
        onSuccess: () => {
          setSubmitted(selectedDate);
          setNotes("");
        },
      },
    );
  }

  function handleMarkAnother() {
    setSelectedDate(null);
    setSubmitted(null);
    setNotes("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.35 }}
      className="mt-8"
    >
      {/* Section heading */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          Quick Attendance
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Mark your attendance and track your requests.
        </p>
      </div>

      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="mb-4" data-ocid="attendance.tab">
          <TabsTrigger value="mark" data-ocid="attendance.mark.tab">
            <Calendar className="h-4 w-4 mr-1.5" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="requests" data-ocid="attendance.requests.tab">
            <FileText className="h-4 w-4 mr-1.5" />
            My Requests
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Mark Attendance ── */}
        <TabsContent value="mark">
          <Card className="shadow-card border-border">
            <CardContent className="pt-6">
              {submitted ? (
                /* Success state */
                <motion.div
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center text-center py-6 gap-4"
                  data-ocid="attendance.success_state"
                >
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      Attendance Submitted
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Attendance for{" "}
                      <span className="font-medium text-foreground">
                        {formatDateLabel(submitted)}
                      </span>{" "}
                      has been submitted for School Admin approval. Once
                      approved, it will reflect in payroll.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleMarkAnother}
                    data-ocid="attendance.mark_another.button"
                  >
                    Mark Another Date
                  </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendar */}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Select Date
                    </p>
                    <AttendanceCalendar
                      selectedDate={selectedDate}
                      onSelect={setSelectedDate}
                    />
                  </div>

                  {/* Right panel */}
                  <div className="flex flex-col gap-4">
                    {selectedDate ? (
                      <>
                        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Selected Date
                            </p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">
                              {formatDateLabel(selectedDate)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                              Status
                            </p>
                            <Badge className="mt-1 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                              ✓ Present
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="attendance-notes"
                            className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                          >
                            Notes (optional)
                          </label>
                          <Textarea
                            id="attendance-notes"
                            placeholder="Add optional notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="resize-none"
                            data-ocid="attendance.notes.textarea"
                          />
                        </div>

                        <Button
                          onClick={handleSubmit}
                          disabled={submitMutation.isPending}
                          className="w-full"
                          data-ocid="attendance.submit.primary_button"
                        >
                          {submitMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Attendance"
                          )}
                        </Button>

                        {submitMutation.isError && (
                          <p
                            className="text-xs text-destructive"
                            data-ocid="attendance.submit.error_state"
                          >
                            Failed to submit. Please try again.
                          </p>
                        )}
                      </>
                    ) : (
                      <div
                        className="flex flex-col items-center justify-center h-full text-center py-8 gap-2"
                        data-ocid="attendance.date_prompt.empty_state"
                      >
                        <Calendar className="h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          Select a date on the calendar to mark your attendance.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: My Requests ── */}
        <TabsContent value="requests">
          <Card className="shadow-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                My Attendance Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {correctionsLoading ? (
                <div
                  className="flex items-center justify-center py-10"
                  data-ocid="attendance.requests.loading_state"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : myRequests.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-10 text-center gap-2"
                  data-ocid="attendance.requests.empty_state"
                >
                  <ClipboardList className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    No requests yet.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Attendance you mark will appear here for tracking.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRequests.map((req: any, i: number) => {
                    const statusColors: Record<string, string> = {
                      pending:
                        "bg-yellow-100 text-yellow-700 border-yellow-200",
                      approved: "bg-green-100 text-green-700 border-green-200",
                      rejected: "bg-red-100 text-red-700 border-red-200",
                    };
                    const requestedStatusColors: Record<string, string> = {
                      Present: "bg-green-100 text-green-700 border-green-200",
                      Absent: "bg-red-100 text-red-700 border-red-200",
                      Late: "bg-yellow-100 text-yellow-700 border-yellow-200",
                    };
                    const statusClass =
                      statusColors[req.status] ??
                      "bg-muted text-muted-foreground border-border";
                    const requestedClass =
                      requestedStatusColors[req.requestedStatus] ??
                      "bg-muted text-muted-foreground border-border";

                    return (
                      <div
                        key={req.id}
                        data-ocid={`attendance.requests.item.${i + 1}`}
                        className="flex items-start justify-between gap-3 border border-border rounded-xl p-4 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {bigIntToDateString(req.date)}
                          </p>
                          {req.reason && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {req.reason}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${requestedClass}`}
                          >
                            {req.requestedStatus}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${statusClass}`}
                          >
                            {req.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function TeacherDashboard({
  onNavigate,
  user,
  roleLabel,
}: {
  onNavigate: (page: string) => void;
  user: { name?: string; role?: string; username?: string } | null;
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

      {/* Quick Attendance Tabs */}
      <QuickAttendanceSection username={user?.username ?? user?.name ?? ""} />
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
