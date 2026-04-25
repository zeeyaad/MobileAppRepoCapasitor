# Sport Activity Management - Role-Based Testing

This guide focuses on testing the interactions between **Sport Activity Specialists** (who create/draft sports) and **Sport Activity Managers** (who approve, create, and manage them).

---

## 1. Create a Sport (As Specialist)
**Goal:** Create a new sport that requires approval.

- **Role:** `SportActivitySpecialist` (Ensure your user token has this role)
- **Endpoint:** `POST http://localhost:3000/api/sports`
- **Body (JSON):**
```json
{
  "name_en": "Draft Sport",
  "name_ar": "الرياضة المسودة",
  "description_en": "Testing approval flow",
  "description_ar": "اختبار تدفق الموافقة",
  "max_participants": 20
  // Note: Specialists CANNOT send 'price'
}
```

**Expected Response (201 Created):**
- **Status:** `pending`
- **Message:** "Sport created and pending approval"

---

## 2. Approve Pending Sport (As Manager)
**Goal:** Approve the sport created by the Specialist.

- **Role:** `SportActivityManager` (Ensure your user token has this role)
- **Endpoint:** `POST http://localhost:3000/api/sports/<SPORT_ID>/approve`
- **Body (JSON):**
```json
{
  "action": "approve",
  "comments": "Looking good, approved."
}
```

**Expected Response (200 OK):**
- **Status:** `active`
- **Message:** "Sport approved successfully"

---

## 3. Create a Sport Directly (As Manager)
**Goal:** Create a sport that is instantly active.

- **Role:** `SportActivityManager`
- **Endpoint:** `POST http://localhost:3000/api/sports`
- **Body (JSON):**
```json
{
  "name_en": "Manager Sport",
  "name_ar": "رياضة المدير",
  "price": 1500,  // Managers CAN set price
  "max_participants": 50
}
```

**Expected Response (201 Created):**
- **Status:** `active`
- **Message:** "Sport created and activated successfully"

---

## 4. Permission Checks (Try to Break Rules)

### A. Specialist Sets Price
- **Role:** `SportActivitySpecialist`
- **Action:** Try creating a sport with `"price": 1000`.
- **Expected:** `400 Bad Request` or `Error: Specialists cannot set prices`.

### B. Specialist Approves Sport
- **Role:** `SportActivitySpecialist`
- **Action:** Try hitting the `/approve` endpoint on any pending sport.
- **Expected:** `403 Forbidden` or `Error: Only Managers can approve`.

### C. Update Price (As Specialist)
- **Role:** `SportActivitySpecialist`
- **Action:** Try hitting `PUT /api/sports/<ID>` with `"price": 2000`.
- **Expected:** `400 Error: Only Managers can update prices`.

---

## 5. Toggle Sport Status (Manager Only)
**Goal:** Deactivate a sport completely.

- **Role:** `SportActivityManager`
- **Endpoint:** `PATCH http://localhost:3000/api/sports/<SPORT_ID>/toggle-status`

**Expected Response:**
- **Message:** "Sport deactivated successfully" (if it was active) or "activated" (if inactive).

---

## Troubleshooting
- **401 Unauthorized**: Check your Bearer token.
- **403 Forbidden**: Verify the user's `staff_type_id` corresponds to the correct role code (`SPORT_SPECIALIST` vs `SPORT_MANAGER`).
