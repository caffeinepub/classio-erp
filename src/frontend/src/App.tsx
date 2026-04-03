import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import AuthGate from "./components/AuthGate";
import Sidebar from "./components/Sidebar";
import { useCallerUserProfile } from "./hooks/useQueries";
import AnnouncementsPage from "./pages/AnnouncementsPage";
import AttendancePage from "./pages/AttendancePage";
import ClassesPage from "./pages/ClassesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursesPage from "./pages/CoursesPage";
import DashboardPage from "./pages/DashboardPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import GradesPage from "./pages/GradesPage";
import LeaveRequestsPage from "./pages/LeaveRequestsPage";
import PayrollPage from "./pages/PayrollPage";
import SettingsPage from "./pages/SettingsPage";
import StaffPage from "./pages/StaffPage";
import StudentsPage from "./pages/StudentsPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import TeachersPage from "./pages/TeachersPage";
import UserManagementPage from "./pages/UserManagementPage";

type Page =
  | "dashboard"
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
  | "user-management"
  | "settings";

function MainApp() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const { data: userProfile } = useCallerUserProfile();

  const handleNavigate = (page: string) => {
    setActivePage(page as Page);
    if (page !== "course-detail") setActiveCourseId(null);
  };

  const handleCourseDetail = (courseId: string) => {
    setActiveCourseId(courseId);
    setActivePage("course-detail");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={handleNavigate} />;
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
          <CourseDetailPage
            courseId={activeCourseId}
            onBack={() => setActivePage("courses")}
          />
        ) : (
          <CoursesPage onCourseDetail={handleCourseDetail} />
        );
      case "submissions":
        return <SubmissionsPage />;
      case "user-management":
        return <UserManagementPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        userProfile={userProfile ?? null}
      />
      <main className="flex-1 overflow-y-auto">
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
    <>
      <AuthGate>
        <MainApp />
      </AuthGate>
      <Toaster richColors position="top-right" />
    </>
  );
}
