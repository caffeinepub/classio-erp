# Classio ERP

## Current State

- Payroll records exist with an `isPaid` boolean; School Admin can click "Mark Paid" which calls `markPayrollAsPaid(id)` on the backend.
- Expenses have a dedicated module with categories including "Salaries", but there is NO automatic linkage — marking a salary as paid does NOT create an expense entry.
- `getTotalExpenses()` and `getTotalFeesCollected()` exist on the backend but there is no P&L / Balance Sheet report page.
- No `getAllPayrollRecords()` backend function exists (payroll can only be queried per-staff).

## Requested Changes (Diff)

### Add
- `getAllPayrollRecords()` backend query returning all payroll records across all staff.
- Auto-expense creation: when `markPayrollAsPaid` is called, the backend atomically creates an `Expense` record with category `"Salaries"`, description `"Salary - <staffId> - Month/Year"`, amount = `netPay`, date = current time, approvedBy = `"Payroll System"`.
- New `FinancialReportPage.tsx` page accessible to School Admins showing:
  - **Income section**: total fees collected (from payments), broken down by month if possible.
  - **Expenses section**: all expenses aggregated by category (Salaries, Rent, Utilities, etc.).
  - **Profit & Loss summary**: Total Income − Total Expenses = Net Profit / Loss.
  - **Balance Sheet summary**: Assets (fee receivables from unpaid invoices + cash collected), Liabilities (unpaid payroll), Net Equity.
  - Period filter: current month, current year, all time.
  - Printable/exportable view.
- Sidebar entry "Financial Report" under Finance section for School Admins.

### Modify
- `markPayrollAsPaid` backend function: after setting `isPaid = true`, atomically call `createExpense` internally so the expense is created in the same transaction.
- `ExpensesPage.tsx`: salary auto-entries from payroll will appear in the expenses list with category "Salaries" — no changes needed to the page itself, it will just show them automatically.
- `PayrollPage.tsx`: after marking paid, invalidate both `["payroll"]` and `["expenses"]` query caches so both pages reflect the new state immediately.

### Remove
- Nothing removed.

## Implementation Plan

1. **Backend `main.mo`**:
   - Add `getAllPayrollRecords()` public query returning `[PayrollRecord]`.
   - Modify `markPayrollAsPaid(payrollId)` to also call internal expense creation: generate a unique expense id, set category = `"Salaries"`, description = `"Salary - " # record.staffId # " - " # Nat.toText(record.month) # "/" # Nat.toText(record.year)`, amount = `record.netPay`, date = `Time.now()`, approvedBy = `"Payroll System"`.

2. **Frontend**:
   - Add `useAllPayrollRecords()` hook in `useQueries.ts`.
   - Update `useMarkPayrollAsPaid` mutation to also invalidate `["expenses"]` query key on success.
   - Create `src/frontend/src/pages/FinancialReportPage.tsx` with:
     - Period selector (This Month / This Year / All Time).
     - Income table: fee payments grouped by month.
     - Expenses table: grouped by category with subtotals.
     - P&L summary card: Total Income, Total Expenses, Net Profit/Loss (color-coded).
     - Balance Sheet card: Assets (cash collected + outstanding invoices), Liabilities (unpaid net payroll), Net Equity.
     - Print button.
   - Add route `/financial-report` in `App.tsx`.
   - Add sidebar item "Financial Report" (e.g., BarChart icon) visible only to School Admin and Super Admin.
