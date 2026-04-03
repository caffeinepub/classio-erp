# Classio ERP

## Current State
- Teachers see a "My Account" section in sidebar with My Leave Requests, My Attendance, and Salary Slip
- Teachers also see an "Academic" section and potentially "Administration" and other sections
- The "leave-requests" item (HR Management section) is shown to teachers
- Sidebar filtering for teachers is inconsistent -- isSectionVisible shows Academic for teachers, and Administration for teachers (which includes Teacher Accounts and Settings)
- App.tsx has no route guard -- teachers can navigate to any page by URL/back-button if they know the page ID
- School Admin's Leave Requests page (LeaveRequestsPage) shows pending leave requests with Approve/Reject buttons based on role check inside the component
- Attendance data submitted by teachers (via MyAttendancePage correction requests) is already stored in backend
- Leave requests submitted by teachers (via MyLeaveRequestsPage) are already visible on LeaveRequestsPage for admins

## Requested Changes (Diff)

### Add
- Route guard in App.tsx: if user role is "teacher", only allow navigation to ["dashboard", "my-leave-requests", "my-attendance", "salary-slip", "settings"]. Any attempt to load another page redirects to dashboard.
- Teacher-specific sidebar: show ONLY "My Account" section (My Leave Requests, My Attendance, Salary Slip) plus a Settings link -- hide all other sections and the Dashboard top-level item for teachers.

### Modify
- Sidebar.tsx: For teacher role, show only "My Account" section items + Settings. Remove Dashboard top-level link for teachers (they already have the feature cards). Remove Academic, Admissions, Finance, Communication, HR Management, LMS, Administration, Super Admin sections for teachers.
- App.tsx: Add teacher route guard -- redirect teachers away from admin pages back to dashboard.
- LeaveRequestsPage.tsx: Already handles role-based view (admin sees all with Approve/Reject; teacher sees own). No changes needed there.
- MyAttendancePage.tsx and MyLeaveRequestsPage.tsx: Data already flows to admin dashboard. No changes needed.

### Remove
- Teacher access to: dashboard (redirect to teacher-home/dashboard is fine but they won't see admin stats), attendance (admin attendance page), teachers, students, classes, grades, announcements, staff, departments, leave-requests (HR section), payroll, courses, submissions, user-management, school-admins, invoices, payments, expenses, fee-structures.

## Implementation Plan
1. Update Sidebar.tsx: For teacher role, hide the top-level Dashboard nav item and all sections except My Account; add a standalone Settings link for teachers.
2. Update App.tsx: Add a teacher route guard in renderPage() -- if user is teacher and activePage is not in the allowed set, render TeacherDashboard (dashboard page) instead.
