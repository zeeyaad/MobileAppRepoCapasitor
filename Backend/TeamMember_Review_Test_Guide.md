# Team Member Review - Role-Based Testing

This guide focuses on testing the **review functionality** for Team Members, ensuring only `SportActivitySpecailtst` and `SportActivityManager` can access the full registry.

---

## 1. Access as Sport Manager
**Goal:** Verify a Sport Manager can view all team members.

- **Role:** `SportActivityManager` (Ensure your user token has this role)
- **Endpoint:** `GET http://localhost:3000/api/register/team-member/review-all`
- **Headers:** `Authorization: Bearer <MANAGER_TOKEN>`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 102,
      "name_en": "Team Player",
      "name_ar": "لاعب فريق",
      "position": "player",
      "status": "active",
      "teams": ["Football", "Volleyball"]
    },
    // ... more members
  ]
}
```

---

## 2. Access as Sport Specialist
**Goal:** Verify a Sport Specialist can view all team members.

- **Role:** `SportActivitySpecialist` (Ensure your user token has this role)
- **Endpoint:** `GET http://localhost:3000/api/register/team-member/review-all`
- **Headers:** `Authorization: Bearer <SPECIALIST_TOKEN>`

**Expected Response (200 OK):**
- Same as above.

---

## 3. Permission Checks (Try to Break Rules)

### A. Access as Regular Member
- **Role:** `Member` (or no token)
- **Action:** Try hitting the `/review-all` endpoint with a Member's token.
- **Expected:** `403 Forbidden` or `401 Unauthorized`.

### B. Access as HR/Admin (If applicable)
- **Role:** `HR_Specialist` (or any other staff role NOT sport-related)
- **Action:** Try hitting the endpoint.
- **Expected:** `403 Forbidden` - "Access denied. Only Sport Manager or Specialist allowed."

---

## Troubleshooting
- **401 Unauthorized**: Check if your token is valid and sent in the header.
- **403 Forbidden even if Manager**:
    - Check your `staff_type` table. Does the code match `SPORT_MANAGER` or `SPORT_SPECIALIST` exactly?
    - If your database uses different codes (e.g., `SPORT_MGR`), updates to the backend route check will be needed.
