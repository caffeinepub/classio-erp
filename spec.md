# Classio ERP

## Current State
Backend generated with: Student, Teacher, Class, Attendance, Grades, Announcements, Dashboard stats, Settings, and role-based authorization (Admin, Teacher, Student). Authorization component is selected.

## Requested Changes (Diff)

### Add
- **Super Admin role**: Highest privilege role that can create and manage Admin accounts, view all school data, configure school-wide settings. Only Super Admin can promote users to Admin.
- **Human Resources (HR) Management module**:
  - Staff records: all school staff (name, role/position, department, employment type, hire date, salary, contact info)
  - Leave management: staff can apply for leave; HR/Admin can approve or reject
  - Payroll summary: record monthly salary disbursement per staff member
  - Departments: create and manage departments (e.g. Administration, Science Dept, etc.)
- **Learning Management System (LMS) module**:
  - Courses: create courses linked to a class/subject (title, description, teacher, class)
  - Lessons/Content: add lessons to a course (title, content text, order)
  - Assignments: create assignments per course (title, instructions, due date)
  - Submissions: students submit work (text submission), teachers can grade submissions
  - Resources: upload links/external URLs as course resources

### Modify
- Extend roles to include: SuperAdmin, Admin, HR, Teacher, Student
- Dashboard updated to show HR stats (total staff, pending leaves) and LMS stats (active courses, submissions pending grading)

### Remove
N/A

## Implementation Plan
1. Regenerate Motoko backend including all original features plus:
   - SuperAdmin role with admin-creation capability
   - HR: Staff CRUD, Leave requests (apply/approve/reject), Payroll records, Department CRUD
   - LMS: Course CRUD, Lesson CRUD, Assignment CRUD, Submission CRUD with grading, Resource links
   - Extended role system: superAdmin > admin > hr / teacher > student
2. Update frontend with:
   - New sidebar sections: HR Management, Learning (LMS)
   - Super Admin panel: user management, create/assign admins
   - HR module pages: Staff list, Leave requests board (Kanban-style approve/reject), Payroll table, Departments
   - LMS module pages: Courses list, Course detail (lessons + assignments), Assignment submissions viewer, Resource links
