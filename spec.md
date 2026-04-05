# Classio ERP

## Current State
Teacher accounts (and School Admin accounts) created by users are stored exclusively in `localStorage` under the key `classio_registered_users`. This means:
- Accounts are lost when the browser cache is cleared
- Accounts only exist on the device/browser where they were created
- Different users (e.g., a teacher logging in from a different device) cannot authenticate
- The "fetch data" issue is directly caused by this — dynamically registered accounts are not fetched from the backend

The backend has no user account storage at all. `useLocalAuth.tsx` reads/writes accounts from `localStorage`. `UserManagementPage.tsx` also reads directly from `localStorage` to list/delete accounts.

## Requested Changes (Diff)

### Add
- `userAccounts` stable map in the backend: stores `username -> { passwordHash, role, name }` records
- Backend functions: `getAllUserAccounts`, `createUserAccount`, `deleteUserAccount`, `validateUserAccount`
- On app startup, `useLocalAuth` migrates any existing `classio_registered_users` from localStorage into the backend (one-time migration)

### Modify
- `useLocalAuth.tsx`: `login()` validates credentials against backend (via actor) in addition to built-in ACCOUNTS; `registerUser()` creates account in backend; session (logged-in user object) still stored in localStorage for UI state only
- `UserManagementPage.tsx`: account list fetched from backend via new query hook; delete also calls backend
- `useQueries.ts`: add `useUserAccounts`, `useCreateUserAccount`, `useDeleteUserAccount` hooks

### Remove
- Direct localStorage reads/writes for `classio_registered_users` in `UserManagementPage.tsx` and `useLocalAuth.tsx`

## Implementation Plan
1. Add `UserAccount` type and `userAccounts` stable map to `main.mo` with `getAllUserAccounts`, `createUserAccount`, `deleteUserAccount`, `validateUserAccount` functions
2. Regenerate `backend.d.ts` type bindings
3. Add React Query hooks in `useQueries.ts` for user account operations
4. Update `useLocalAuth.tsx` to validate login against backend accounts (with fallback to built-in ACCOUNTS)
5. Update `UserManagementPage.tsx` to list/create/delete accounts via backend hooks
6. Add one-time localStorage migration on app init
