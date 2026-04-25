# Staff Privilege Synchronization Analysis

This report details the root causes behind the critical issue where staff members, despite being assigned "Full Privileges" (whether via packages or individual grants), fail to access essential administrative functions such as the Dashboard, Audit Logs, and Staff Management.

## 📉 Problem Context
When an administrator grants a staff member full access privileges through the backend management UI, that staff member's account still cannot see or navigate to certain restricted pages (Dashboard, Audit logs, Staff modifications). The user reported: *"I don't have any access for staff editing or creating if I have the full admin privileges and I don't see audit logs, I can't see the dashboard too."*

## 🔍 Root Cause Analysis

After tracing the entire flow from backend privilege calculation (`PrivilegeCalculationService`) to the frontend's authentication and routing layer (`AuthContext`, `AppSidebar`, `staffDashboard`), two distinct architectural disconnects were identified.

### Root Cause 1: Frontend Route Expectation vs. Database Reality (String Mismatches)
The fundamental issue preventing access to Staff Management and Audit Logs is a mismatch between the privilege codes requested by the frontend React components and the actual codes stored in the PostgreSQL database.

*   **Database (`privileges` table):** Contains specific strings like `CREATE_STAFF`, `VIEW_AUDIT_LOGS`, and `UPDATE_STAFF`.
*   **Frontend Check (`staffDashboard.tsx` & `AppSidebar.tsx`):** Uses `hasPrivilege('STAFF_CREATE')`, `hasPrivilege('audit.view')`, etc.

When a staff member receives the "Full Privileges" package, the backend returns an array of privileges containing `CREATE_STAFF` and `VIEW_AUDIT_LOGS`. However, when the frontend attempts to map the UI, it asks `hasPrivilege('STAFF_CREATE')`. Since `STAFF_CREATE` is not in the array, the UI component silently fails the authorization check and hides the menu item. 

*(Note: The reason elements like "View Members" or "View Sports" worked is purely coincidental because their strings (`VIEW_MEMBERS`, `VIEW_SPORTS`) happen to match identically between the frontend and the database).*

### Root Cause 2: Hardcoded Fallback Privileges Bypassing Standard Users
The reason the staff member cannot access the **Dashboard** is due to a structural limitation in `src/context/AuthContext.tsx`.

The database does **not** contain a privilege for `dashboard.view`. To solve this, the frontend defined a map in `src/types/auth.ts` (`ROLE_PRIVILEGES`) that automatically grants `"dashboard.view"` to valid internal roles like `STAFF` and `SPORTS_DIRECTOR`.

However, the logic in `AuthContext.tsx` intentionally restricts these fallback privileges **strictly to Administrators**:

```typescript
// Location: src/context/AuthContext.tsx (Line 91)
const fallbackPrivileges = role === "ADMIN" ? normalizePrivileges(ROLE_PRIVILEGES.ADMIN) : [];
```

Because of this specific line, if a user's role is `STAFF`, their `fallbackPrivileges` array remains completely empty. It entirely ignores `ROLE_PRIVILEGES.STAFF`. Since they don't receive the fallback `"dashboard.view"`, and the database cannot grant it (as it doesn't exist), the dashboard is perpetually locked out for any non-Admin user, regardless of how many external packages they are assigned.

---

## 🛠️ How We Can Fix It (Actionable Plan)

To resolve the synchronization issues and restore correct access rights, the following changes need to be applied:

### Step 1: Fix `AuthContext.tsx` Logic
Modify the `buildUserToken` function in `AuthContext.tsx` to respect the `ROLE_PRIVILEGES` map for **all roles**, ensuring that base elements like the dashboard are accessible to authorized staff.

**Change from:**
```typescript
const fallbackPrivileges = role === "ADMIN" ? normalizePrivileges(ROLE_PRIVILEGES.ADMIN) : [];
```
**Change to:**
```typescript
const fallbackPrivileges = normalizePrivileges(ROLE_PRIVILEGES[role] || []);
```

### Step 2: Harmonize Frontend Privilege Strings
Perform a systematic refactor across the `src` directory (specifically touching `AppSidebar.tsx`, `staffDashboard.tsx`, `DashboardPage.tsx`, and `auth.ts`) to align the frontend privilege checks with the database truth.

**Required Replacements:**
*   Change `STAFF_CREATE` ➡️ `CREATE_STAFF`
*   Change `STAFF_VIEW` ➡️ `VIEW_STAFF`
*   Change `STAFF_EDIT` ➡️ `UPDATE_STAFF`
*   Change `STAFF_DELETE` ➡️ `DELETE_STAFF`
*   Change `audit.view` ➡️ `VIEW_AUDIT_LOGS`

### Step 3: Address `VIEW_FINANCE` Discrepancy
The frontend attempts to protect financial routes using a general `VIEW_FINANCE` string, but the database separates this into `VIEW_INVOICES`, `VIEW_PAYMENTS`, and `VIEW_BUDGETS`.
*   **Fix:** Update `staffDashboard.tsx` and `AppSidebar.tsx` to either use `hasAnyPrivilege(["VIEW_INVOICES", "VIEW_PAYMENTS"])` or standardise the frontend components to check for `VIEW_INVOICES` specifically.

Implementing these three steps will completely synchronize the backend constraints with the frontend expectations, immediately fixing the display and routing problems.
