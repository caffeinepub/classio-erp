# Classio ERP

## Current State

- **FeeStructuresPage**: Allows creating individual fee structure entries, each with a single fee type (tuition/quarterly/activity/other), grade level, and amount. Multiple separate entries are needed to represent all fees for one grade. No consolidated view per grade.
- **PaymentsPage**: Allows recording payments by selecting an invoice first (invoice-based flow). Student name is derived from the selected invoice. No direct student-first selection. No receipt generation/print.

## Requested Changes (Diff)

### Add
- **Consolidated Fee Structure Form**: A single form per grade that captures all fee components at once:
  - Grade (required)
  - Tuition Fees (₹, required)
  - Activity Fees (₹, required)
  - Term Fees (₹, required)
  - Total Fees (auto-calculated as sum, but also editable manually)
  - Academic Year
  - Active toggle
- **Grade-based fee sync**: Fee structure table grouped/displayed by grade so fees are visible per grade in one row
- **Student Name Selection in Payments**: Add a student picker dropdown (first step) that filters/shows students by name. When a student is selected, show their outstanding invoices or allow entering a custom amount.
- **Receipt Generation**: After recording a payment, show a printable receipt modal with: receipt number, student name, grade, payment date, amount, payment method, fee type breakdown, school name, and a Print/Download button.

### Modify
- **FeeStructuresPage**: Replace single-fee-type form with consolidated per-grade form showing tuition, activity, term, and total fields in one dialog. Table rows should show all fee components per grade in columns.
- **PaymentsPage**: Change flow to: (1) Select Student by name, (2) Select invoice or enter amount, (3) Select payment method, (4) Record payment and show receipt. Student name must be prominently displayed in both the form and the payments table.

### Remove
- Remove the fee-type dropdown (tuition/quarterly/activity/other) from fee structure form — replaced by fixed fields for each fee component

## Implementation Plan

1. **FeeStructuresPage.tsx**:
   - Change form fields: remove fee type dropdown, add separate numeric inputs for tuition_fees, activity_fees, term_fees, total_fees (auto-sum but overridable)
   - Update table columns: Grade, Academic Year, Tuition Fees, Activity Fees, Term Fees, Total Fees, Status, Actions
   - Note: backend FeeStructure model has `amount` (single bigint) and `feeType`/`feeTypeLabel` fields. Since we can't change the backend, store all fee components encoded in the `description` field as JSON, use `amount` for total fees, and use `feeType='consolidated'`. Display by parsing description.
   - Alternatively, use `name` for grade label, `feeTypeLabel` to store JSON of components.

2. **PaymentsPage.tsx**:
   - Add student selector dropdown at top of form (search by name)
   - When student selected, filter invoices to that student's unpaid invoices
   - Student name column in payments table (already present but improve display)
   - After successful payment submission, show a Receipt Dialog with printable content
   - Receipt includes: receipt no, student name, grade, amount, method, date, fee breakdown

3. **Data sync**: FeeStructures fetched via `useAllFeeStructures`, Students via `useAllStudents` — these are already in place. No new backend calls needed.
