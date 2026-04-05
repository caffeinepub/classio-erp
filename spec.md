# Classio ERP

## Current State

Teachers submit attendance requests via `submitAttendanceCorrection` (no auth required). School Admins should see these in the Attendance > Teacher Requests tab. The approve/reject backend functions require `hasAppRole(caller, "hr")` -- but all users including School Admins use anonymous ICP actors (localStorage-based auth), so the caller principal has no user profile and the role check always fails, preventing approval/rejection. Additionally, the Teacher Requests tab only fetches `getPendingAttendanceCorrections`, so once approved/rejected they disappear from admin view. The display shows only `staffId` (username string) not the teacher's actual name.

## Requested Changes (Diff)

### Add
- `getAllAttendanceCorrections()` backend query that returns all corrections regardless of status
- Hook `useAllAttendanceCorrections` in useQueries.ts

### Modify
- Remove `hasAppRole` check from `approveAttendanceCorrection` and `rejectAttendanceCorrection` backend functions (entire app uses anonymous actors; auth is handled at the localStorage/UI level)
- AttendancePage Teacher Requests tab: use `useAllAttendanceCorrections` instead of `usePendingAttendanceCorrections`; resolve `staffId` to teacher full name using the teachers list; show all statuses with color-coded badges

### Remove
- Nothing removed

## Implementation Plan

1. Backend (`main.mo`): Remove `hasAppRole` guard from `approveAttendanceCorrection` and `rejectAttendanceCorrection`; add `getAllAttendanceCorrections` public query
2. Frontend (`backend.d.ts`): Add `getAllAttendanceCorrections` to the interface
3. Frontend (`useQueries.ts`): Add `useAllAttendanceCorrections` hook
4. Frontend (`AttendancePage.tsx`): Switch Teacher Requests tab to use `useAllAttendanceCorrections`; show teacher full name by mapping `staffId` -> teacher from teachers list; show all statuses with badges; keep approve/reject buttons visible only for pending items
