import { Toaster } from "@/components/ui/sonner";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import AuthGate from "./components/AuthGate";
import InstallPrompt from "./components/InstallPrompt";
import Sidebar from "./components/Sidebar";
import { LocalAuthProvider, useLocalAuth } from "./hooks/useLocalAuth";
import AdmissionsPage from "./pages/AdmissionsPage";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AttendancePage from "./pages/AttendancePage";
import ClassesPage from "./pages/ClassesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import ExpensesPage from "./pages/ExpensesPage";
import FeeStructuresPage from "./pages/FeeStructuresPage";
import FinancialReportPage from "./pages/FinancialReportPage";
import GradesPage from "./pages/GradesPage";
import InvoicesPage from "./pages/InvoicesPage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";
import MyAttendancePage from "./pages/MyAttendancePage";
import MyLeaveRequestsPage from "./pages/MyLeaveRequestsPage";
import PaymentsPage from "./pages/PaymentsPage";
import PayrollPage from "./pages/PayrollPage";
import SalarySlipPage from "./pages/SalarySlipPage";
import SchoolAdminsPage from "./pages/SchoolAdminsPage";
import SettingsPage from "./pages/SettingsPage";
import StaffPage from "./pages/StaffPage";
import StudentsPage from "./pages/StudentsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import TeachersPage from "./pages/TeachersPage";
import UserManagementPage from "./pages/UserManagementPage";

type Page =
  | "dashboard"
  | "admissions"
  | "students"
  | "teachers"
  | "classes"
  | "attendance"
  | "grades"
  | "announcements"
  | "staff"
  | "departments"
  | "leave-requests"
  | "payroll"
  | "courses"
  | "course-detail"
  | "submissions"
  | "fee-structures"
  | "invoices"
  | "payments"
  | "expenses"
  | "school-admins"
  | "user-management"
  | "settings"
  | "my-leave-requests"
  | "my-attendance"
  | "salary-slip"
  | "financial-report";

const MAX_HISTORY = 20;

const TEACHER_ALLOWED_PAGES: Page[] = [
  "dashboard",
  "my-leave-requests",
  "my-attendance",
  "salary-slip",
  "settings",
];

function MainApp() {
  const { user } = useLocalAuth();
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [pageHistory, setPageHistory] = useState<Page[]>(["dashboard"]);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const canGoBack = pageHistory.length > 1;

  const handleNavigate = (page: string) => {
    const newPage = page as Page;
    setActivePage(newPage);
    if (newPage !== "course-detail") setActiveCourseId(null);
    setPageHistory((prev) => {
      const next = [...prev, newPage];
      return next.length > MAX_HISTORY
        ? next.slice(next.length - MAX_HISTORY)
        : next;
    });
  };

  const handleBack = () => {
    setPageHistory((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.slice(0, -1);
      const prevPage = next[next.length - 1];
      setActivePage(prevPage);
      if (prevPage !== "course-detail") setActiveCourseId(null);
      return next;
    });
  };

  const handleCourseDetail = (courseId: string) => {
    setActiveCourseId(courseId);
    setActivePage("course-detail");
    setPageHistory((prev) => {
      const next = [...prev, "course-detail" as Page];
      return next.length > MAX_HISTORY
        ? next.slice(next.length - MAX_HISTORY)
        : next;
    });
  };

  const renderPage = () => {
    if (
      user?.role === "teacher" &&
      !TEACHER_ALLOWED_PAGES.includes(activePage)
    ) {
      return <DashboardPage onNavigate={handleNavigate} />;
    }

    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;
      case "admissions":
        return <AdmissionsPage />;
      case "students":
        return <StudentsPage />;
      case "teachers":
        return <TeachersPage />;
      case "classes":
        return <ClassesPage />;
      case "attendance":
        return <AttendancePage />;
      case "grades":
        return <GradesPage />;
      case "announcements":
        return <AnnouncementsPage />;
      case "staff":
        return <StaffPage />;
      case "departments":
        return <DepartmentsPage />;
      case "leave-requests":
        return <LeaveRequestsPage />;
      case "payroll":
        return <PayrollPage />;
      case "courses":
        return <CoursesPage onCourseDetail={handleCourseDetail} />;
      case "course-detail":
        return activeCourseId ? (
          <CourseDetailPage courseId={activeCourseId} onBack={handleBack} />
        ) : (
          <CoursesPage onCourseDetail={handleCourseDetail} />
        );
      case "submissions":
        return <SubmissionsPage />;
      case "fee-structures":
        return <FeeStructuresPage />;
      case "invoices":
        return <InvoicesPage />;
      case "payments":
        return <PaymentsPage />;
      case "expenses":
        return <ExpensesPage />;
      case "financial-report":
        return <FinancialReportPage />;
      case "school-admins":
        return <SchoolAdminsPage />;
      case "user-management":
        return <UserManagementPage />;
      case "settings":
        return <SettingsPage />;
      case "my-leave-requests":
        return <MyLeaveRequestsPage />;
      case "my-attendance":
        return <MyAttendancePage />;
      case "salary-slip":
        return <SalarySlipPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      <main className="flex-1 overflow-y-auto">
        {canGoBack && (
          <div className="flex items-center gap-1.5 px-4 pt-3 pb-0">
            <button
              type="button"
              data-ocid="nav.back.button"
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back</span>
            </button>
          </div>
        )}
        {renderPage()}
        <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border mt-8">
          &copy; {new Date().getFullYear()}. Built with{" "}
          <span className="text-red-500">&hearts;</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LocalAuthProvider>
      <AuthGate>
        <MainApp />
      </AuthGate>
      <Toaster richColors position="top-right" />
      <InstallPrompt />
    </LocalAuthProvider>
  );
}
