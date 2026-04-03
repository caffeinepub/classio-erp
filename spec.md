# Classio ERP

## Current State

PayrollPage (`PayrollPage.tsx`) allows School Admins to:
- Select staff from dropdown (useAllStaff + useAllTeachers)
- Choose month/year, salary mode (By Experience / Manual)
- Enter basic salary, allowances, deductions and generate a payroll record
- View payroll records per staff member in a table with Mark Paid action
- No salary slip generation from payroll records yet

SalarySlipPage (`SalarySlipPage.tsx`) is teacher-facing, shows latest salary slip with Basic Salary, Allowances, Deductions, Net Salary. No HRA breakdown, no TDS, no standard Indian format.

PayrollRecord type: `basicSalary`, `allowances`, `deductions`, `netPay`, `month`, `year`, `staffId`, `isPaid`.
SalarySlipData type: `basicSalary`, `allowances`, `deductions`, `netSalary`, `month`, `year`, `staffId`.

Backend API: `generatePayroll(staffId, month, year, basicSalary, allowances, deductions, netPay)` -- totals only, no per-component breakdown stored.

## Requested Changes (Diff)

### Add
1. **Standard Indian salary slip format** with proper breakdown:
   - **Earnings section**: Basic Salary, HRA (40% of Basic by default, editable), Conveyance Allowance (optional), Medical Allowance (optional), Special Allowance (optional), Gross Earnings total
   - **Deductions section**: Provident Fund / PF (12% of Basic by default, editable), TDS / Income Tax (optional, manual entry), Professional Tax (fixed ₹200/month standard, optional), Absent Day Deduction (basicSalary/26 × absentDays, calculated), Other Deductions (manual), Total Deductions
   - **Net Pay** = Gross Earnings - Total Deductions
2. **Generate Salary Slip button** per payroll record row -- opens a printable Dialog modal with the full salary slip
3. **Salary slip form fields in PayrollPage**:
   - Basic Salary (existing, auto from experience or manual)
   - HRA (auto-calculated as 40% of basic, editable)
   - Conveyance Allowance (optional, default 0)
   - Medical Allowance (optional, default 0)
   - Special Allowance (optional, default 0)
   - PF Deduction (auto 12% of basic, editable)
   - TDS / Income Tax (optional, default 0)
   - Professional Tax (default 200, editable)
   - Absent Days (integer, default 0) → auto-calculates absent deduction shown read-only
   - Other Deductions (default 0)
   - Live preview: Gross Earnings, Total Deductions, Net Pay
4. **All teachers + staff merged** in payroll staff dropdown (deduplicated by name)

### Modify
- PayrollPage form: replace simple allowances/deductions fields with the full breakdown above
- When generating payroll, sum all allowances into `allowances` total and all deductions into `deductions` total for backend (backend API unchanged)
- Store form breakdown in component state so salary slip modal can display individual line items immediately after generation
- Payroll records table: add "Salary Slip" button per row (generates slip from stored totals with estimated breakdown shown)
- SalarySlipPage (teacher-facing): update to show standard format -- Basic, HRA (estimated as 40% of basic), Gross, PF (12%), TDS (shown if non-zero from stored deductions), Professional Tax, Net Pay; derive line items from stored totals
- Net Pay preview block in form to show full itemized breakdown

### Remove
- Simple `allowances` and `deductions` number inputs (replaced by itemized fields)

## Implementation Plan

1. Update `PayrollPage.tsx`:
   - Expand form state to include: `hra`, `conveyance`, `medical`, `specialAllowance`, `pf`, `tds`, `professionalTax`, `absentDays`, `otherDeductions`
   - Auto-compute HRA = 40% of basic, PF = 12% of basic when basic changes (but keep editable)
   - Auto-compute absentDeduction = floor(basicSalary / 26) × absentDays (read-only display)
   - On submit: totalAllowances = hra + conveyance + medical + specialAllowance; totalDeductions = pf + tds + professionalTax + absentDeduction + otherDeductions; pass these totals to generatePayroll
   - Live preview card showing full earnings/deductions table with Gross and Net Pay
   - Staff dropdown: merge useAllStaff + useAllTeachers lists, deduplicate by firstName+lastName
   - Add "Salary Slip" button per row in records table → opens Dialog with SalarySlipModal component

2. Create inline `SalarySlipModal` component inside PayrollPage (or as a separate file):
   - Props: payrollRecord, staffName, designation, month, year
   - Full standard Indian salary slip layout:
     - Header: School logo + name + "SALARY SLIP" title + month/year
     - Employee details grid: Name, Employee ID, Designation, Department, Pay Period, Date of Joining (if available)
     - Earnings table: Basic Salary, HRA (40% of basic derived), Conveyance Allowance, Medical Allowance, Special Allowance, **Gross Earnings**
     - Deductions table: Provident Fund (PF), TDS / Income Tax, Professional Tax, Absent Day Deduction, Other Deductions, **Total Deductions**
     - Net Pay highlighted box
     - Footer: "This is a computer-generated salary slip."
     - Print/Download button
   - Since backend only stores totals: derive components from stored basicSalary (HRA=40%, PF=12%, remaining deductions split reasonably) OR store last-generated breakdown in localStorage keyed by payrollRecord.id for accurate slip
   - Use localStorage to persist the breakdown per record so slip is accurate

3. Update `SalarySlipPage.tsx` (teacher-facing):
   - Derive HRA = 40% of basicSalary, PF = 12% of basicSalary from salarySlipData
   - Remaining deductions after PF = TDS + Professional Tax (show as breakdown)
   - Show full standard earnings/deductions table same style as modal
