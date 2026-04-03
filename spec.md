# Classio ERP

## Current State
MyAttendancePage currently shows a "Submit Correction Request" flow -- a modal where teachers enter a date, pick a status (Present/Absent/Late), and add a reason. The page only shows submitted correction requests and uses the `submitAttendanceCorrection` backend call. There is no dedicated "Mark My Attendance" primary tab with a calendar UI.

## Requested Changes (Diff)

### Add
- A prominent "Mark My Attendance" tab (as the default/first tab) inside MyAttendancePage with:
  - A visual calendar (month view) for selecting a date
  - Selected date shown clearly with highlight
  - A "Mark Present" status button (status fixed to Present for primary marking)
  - An optional notes/reason field
  - A Submit button that calls `submitAttendanceCorrection` with status=Present
  - Success confirmation showing the submission went to School Admin for approval
- The submitted attendance requests appear in the School Admin dashboard's existing Attendance Corrections section for approve/reject
- Payroll note: approved attendance feeds into payroll records

### Modify
- Rename existing "Submit Correction Request" functionality to a secondary tab "My Requests" (showing history of all submitted requests with their status: pending/approved/rejected)
- Page title and description updated to reflect the primary use case: marking daily attendance

### Remove
- The redundant standalone "Submit Correction Request" button at the top (the tab flow replaces it)
