# Classio ERP

## Current State
- Local username/password auth with roles: superadmin, schooladmin, teacher, hr
- Super Admin (admin/admin123) can create School Admin accounts
- Sidebar shows role-based nav sections
- All finance pages use formatINR utility but some UI still shows dollar signs
- Teachers module exists separately from Staff module (not linked)
- Student detail form has basic fields (no DOB)
- Teacher form has basic fields (no grade assignment)
- Fee Structures page has basic fee amount input (no fee type dropdown)
- Leave Requests page exists (admin side only, no teacher self-service)
- SchoolAdminsPage only creates schooladmin role (no teacher/hr creation by school admins)
- Attendance module tracks students, not teacher attendance
- No salary slip download in teacher dashboard
- No teacher-specific dashboard pages (leave req form, attendance req, salary slip)

## Requested Changes (Diff)

### Add
- DOB (Date of Birth) field to student form/detail
- Grade field to teacher form
- Fee type dropdown in Fee Structures: Tuition Fees, Quarterly Fees, Activity Fees, Other (with text field when Other selected)
- Teacher self-service dashboard section with: Leave Request form, Attendance Request form, Salary Slip download (PDF generation)
- School Admin ability to create Teacher and HR accounts (not just School Admin accounts) -- extend user creation page
- Role-based access control: School Admin creates users with role selection (Teacher, HR); defines who can edit vs view
- Teacher Attendance tracking module (separate from student attendance)
- School Admin approve/reject leave requests with visible pending leave requests on their dashboard/leave page
- Staff module that auto-syncs teachers -- when a teacher is created, they appear in Staff list

### Modify
- Replace ALL dollar signs ($) with INR (₹) across all pages -- audit every page for currency formatting
- currencyUtils.ts: ensure formatINR and all currency helpers only use ₹ symbol
- SchoolAdminsPage: rename to "User Management" for school admins; allow creating Teacher and HR roles with username/password; show list of created users with their roles
- Leave Requests page: show approve/reject only to schooladmin/superadmin; teachers see only their own leave requests and can submit; staff dropdown replaced with auto-filled current user for teachers
- Sidebar: add "Teacher Dashboard" section for teacher role with: My Leave Requests, My Attendance, Salary Slip
- Attendance page: add tab for Teacher Attendance (mark present/absent for teachers, not students)
- Student detail: add DOB date field
- Teacher form: add Grade field (dropdown matching existing grades)
- Fee Structures: replace free-text amount with fee type selector + amount; fee types: Tuition Fees, Quarterly Fees, Activity Fees, Other (shows text input for custom label)

### Remove
- Dollar ($) symbol from all currency displays
- No student login (already removed, keep as is)

## Implementation Plan
1. Update backend main.mo:
   - Add `dob` field to Student type
   - Add `grade` field to Teacher type  
   - Add `feeType` and `feeTypeLabel` fields to FeeStructure type
   - Add TeacherAttendance type and CRUD functions
   - Add teacher-specific leave request queries (getMyLeaveRequests by staffId)
   - Add salary slip data query

2. Frontend changes:
   - currencyUtils.ts: audit and fix all $ symbols
   - StudentsPage: add DOB field to add/edit form and detail view
   - TeachersPage: add Grade dropdown field; when teacher is created, also create staff record
   - FeeStructuresPage: replace amount input with fee type dropdown + amount; show Other text field
   - LeaveRequestsPage: role-aware -- admins see all + approve/reject; teachers see own requests + submit form
   - SchoolAdminsPage / new UserCreationPage: school admins can create Teacher/HR accounts with username/password; list existing users
   - StaffPage: show teachers in staff list (merged view)
   - Sidebar: add teacher-specific items (My Leave, My Attendance, Salary Slip)
   - TeacherDashboard section: Leave Request form, Attendance Request, Salary Slip download
   - AttendancePage: add Teacher Attendance tab
   - Fix all remaining $ → ₹ in PayrollPage, InvoicesPage, PaymentsPage, ExpensesPage, FeeStructuresPage
