# Classio ERP - Board-Specific Document Templates

## Current State
DocumentsPage exists with 10 document templates. Currently no board differentiation — all forms are generic. User needs board-specific government formats for CBSE, ICSE, and State Board schools.

## Requested Changes (Diff)

### Add
- **Board Selector** at the top of DocumentsPage (CBSE / ICSE / State Board) — persisted in localStorage as `classio_school_board`
- Board-specific field sets and print formats for each document type:
  - **CBSE**: Uses CBSE-specific terminology and mandatory fields per CBSE bye-laws (e.g., TC must have SLC serial number, Examination Board = CBSE, Affiliation No)
  - **ICSE**: CISCE affiliation number, council-specific fields
  - **State Board**: State name selector, state board affiliation, vernacular language fields
- Board badge shown on every printed document
- Affiliation number field in school settings (pulled into document headers)
- Board-specific additional documents:
  - **CBSE only**: SLC (School Leaving Certificate per CBSE format), Provisional Certificate
  - **ICSE only**: CISCE NOC format, Internal Assessment Sheet
  - **State Board only**: State-specific TC format, Caste Certificate Annexure

### Modify
- DocumentsPage: Add board selector at top, board context passed to all document forms and print previews
- Each document form: Show/hide board-specific fields based on selected board
- Print preview headers: Show board name and affiliation number
- SettingsPage: Add school board and affiliation number fields

### Remove
- Nothing removed

## Implementation Plan
1. Read current DocumentsPage.tsx fully to understand structure
2. Rewrite DocumentsPage with board selector and board-specific form variants
3. Update SettingsPage to add board and affiliation number
