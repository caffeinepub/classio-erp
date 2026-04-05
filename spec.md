# Classio ERP

## Current State
- Salary slip generation broken: `formatAmt` function has mangled Unicode (renders `20b91,000` instead of `₹1,000`) in both PayrollPage and SalarySlipPage
- Teacher salary slip page always shows "No salary slip" because `user.username` is used as staffId but backend stores payroll by Staff record ID (different format)
- Salary slip breakdown data stored only in admin's localStorage — teachers on different devices see derived/wrong values
- Logo is hardcoded static asset across all pages — no dynamic logo upload feature
- SettingsPage has no logo upload section
- `getSalarySlipData` in backend returns first indexed record (not most recent)
- Payroll ID uses staffId+netPay which can collide across months

## Requested Changes (Diff)

### Add
- School logo upload feature: School Admins can upload their school logo from Settings page; stored in localStorage as base64; used across sidebar, salary slip, login page
- Logo upload card in SettingsPage (visible to School Admin and Super Admin roles)

### Modify
- Fix `formatAmt` in PayrollPage.tsx: use `₹` character directly, not unicode escape
- Fix `formatAmt` in SalarySlipPage.tsx: same fix
- Fix teacher salary slip staffId lookup: instead of using username directly, resolve the matching payroll record by iterating all payroll records and matching by teacher name or store/retrieve by username properly
- Fix salary slip breakdown storage: save breakdown to backend (via payroll record) OR store in sessionStorage/localStorage keyed by staffId resolved from backend — use `getPayrollRecordsByStaff` with resolved staffId
- Fix salary slip to show the most recent record (sort by year desc, month desc)
- Store salary slip breakdown in the payroll record notes/metadata or as part of a well-known localStorage key that uses staffId from the payroll record itself
- PayrollPage: save breakdown with key using the record's staffId (not username), ensure teachers can retrieve by their linked staffId
- Backend `getSalarySlipData`: return most recent payroll record (sort by year/month desc)
- Fix payroll ID generation to include month+year to avoid collisions
- School logo: when `classio_school_logo` key exists in localStorage, use it as the `src` for all logo `<img>` tags across Sidebar, SalarySlipPage, PayrollPage salary slip dialog, and AuthGate login page

### Remove
- Nothing removed

## Implementation Plan
1. Fix `formatAmt` in PayrollPage.tsx and SalarySlipPage.tsx (use literal `₹`)
2. Fix payroll ID in backend to include month+year
3. Fix `getSalarySlipData` to return most recent record
4. Fix SalarySlipPage staffId resolution: call `getPayrollRecordsByStaff` for all staff, find the record where staffId matches teacher's linked staff, or use a new backend function `getSalarySlipByUsername` that accepts the teacher username and resolves via teacher accounts
5. Fix salary slip breakdown: in PayrollPage when generating, also save breakdown with a key of `payroll_breakdown_${record.staffId}_${record.month}_${record.year}` AND as `payroll_breakdown_latest_${record.staffId}` so teacher can retrieve the latest
6. Fix SalarySlipPage to use `payroll_breakdown_latest_${staffId}` fallback
7. Add logo upload card in SettingsPage (visible to schoolAdmin, superAdmin, hr roles)
8. Update Sidebar, SalarySlipPage, PayrollPage salary slip dialog, AuthGate to read logo from `localStorage.getItem('classio_school_logo')` and fall back to default static asset
