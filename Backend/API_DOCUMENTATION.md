# Helwan Club Backend API Documentation

**Base URL:** `http://localhost:3000/api`

**Authentication:** Most endpoints require JWT Bearer token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Staff Management APIs](#staff-management-apis)
3. [Sport Management APIs](#sport-management-apis)
4. [Membership APIs](#membership-apis)
5. [Registration APIs](#registration-apis)
6. [Team Member APIs](#team-member-apis)
7. [Member Administration APIs](#member-administration-apis)

---

## Authentication APIs

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive JWT token. Supports two login methods:
- Admin/Executive Manager: Login with email and password
- Regular Staff (first login): Login with national_id as both username and password

**Request Body:**
```json
{
  "email": "admin@helwan-club.local",
  "password": "your_password"
}
```

OR (for first-time staff login):
```json
{
  "national_id": "12345678901234",
  "password": "12345678901234"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@helwan-club.local",
    "role": "staff",
    "staff_id": 1,
    "staff_type_id": 1,
    "full_name": "Admin User"
  },
  "requires_credential_change": false
}
```

**Success Response - First Login (200 OK):**
```json
{
  "success": true,
  "message": "First login successful. Please change your credentials.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "requires_credential_change": true,
  "staff_id": 5
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 2. Change Credentials

**Endpoint:** `POST /api/auth/change-credentials`

**Authentication:** Required (JWT token from first login)

**Description:** Change email and password for staff members on first login

**Request Body:**
```json
{
  "new_email": "staff.12345@helwan-club.local",
  "new_password": "NewSecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Credentials updated successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 5,
    "email": "staff.12345@helwan-club.local",
    "staff_id": 5
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

---

## Staff Management APIs

### 1. Get Staff Types

**Endpoint:** `GET /api/staff/types`

**Authentication:** Not required

**Description:** Get all available staff types

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 20,
  "data": [
    {
      "id": 1,
      "code": "ADMIN",
      "name_en": "Admin",
      "name_ar": "المسئول",
      "description_en": "System Administrator",
      "description_ar": "مدير النظام",
      "is_active": true
    },
    {
      "id": 2,
      "code": "CEO",
      "name_en": "Executive Director",
      "name_ar": "المدير التنفيذى",
      "is_active": true
    }
  ]
}
```

---

### 2. Register Staff

**Endpoint:** `POST /api/staff/register`

**Authentication:** Required (Admin, Executive Manager, or Deputy Manager)

**Description:** Register a new staff member. Only ADMIN can register EXECUTIVE_MANAGER.

**Request Body:**
```json
{
  "first_name_en": "John",
  "first_name_ar": "جون",
  "last_name_en": "Doe",
  "last_name_ar": "دو",
  "national_id": "12345678901234",
  "phone": "+201234567890",
  "address": "123 Main St, Cairo",
  "staff_type_id": 8,
  "employment_start_date": "2024-01-15",
  "employment_end_date": null
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Staff member registered successfully",
  "staff_id": 15,
  "email": "staff.12345678901234@helwan-club.local",
  "initial_password": "12345678901234"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Missing required fields: first_name_en, last_name_en, national_id, phone, staff_type_id, employment_start_date"
}
```

**Error Response (403 Forbidden):**
```json
{
  "success": false,
  "message": "Only administrators can create Executive Manager accounts"
}
```

---

### 3. Get All Staff

**Endpoint:** `GET /api/staff`

**Authentication:** Not required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name_en": "Admin",
      "first_name_ar": "المسئول",
      "last_name_en": "User",
      "last_name_ar": "المستخدم",
      "email": "admin@helwan-club.local",
      "national_id": "11111111111111",
      "phone": "+201000000000",
      "staff_type_id": 1,
      "staff_type": "Admin",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### 4. Get Staff by ID

**Endpoint:** `GET /api/staff/:id`

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "first_name_en": "John",
    "first_name_ar": "جون",
    "last_name_en": "Doe",
    "last_name_ar": "دو",
    "email": "staff.12345@helwan-club.local",
    "national_id": "12345678901234",
    "phone": "+201234567890",
    "address": "123 Main St",
    "staff_type_id": 8,
    "employment_start_date": "2024-01-15",
    "employment_end_date": null,
    "status": "active",
    "assigned_packages": [
      {
        "id": 2,
        "code": "FINANCE_PKG",
        "name_en": "Finance Package",
        "name_ar": "حزمة المالية"
      }
    ],
    "privileges": []
  }
}
```

---

### 5. Update Staff

**Endpoint:** `PUT /api/staff/:id`

**Authentication:** Required

**Request Body:**
```json
{
  "first_name_en": "John Updated",
  "phone": "+201987654321",
  "address": "456 New Address"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Staff member updated successfully"
}
```

---

### 6. Get Privilege Packages

**Endpoint:** `GET /api/staff/packages`

**Authentication:** Required

**Description:** Get all available privilege packages

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "code": "ADMIN_PKG",
      "name_en": "Admin Package",
      "name_ar": "حزمة المسئول",
      "description_en": "Full system access",
      "description_ar": "وصول كامل للنظام",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 7. Assign Packages to Staff

**Endpoint:** `POST /api/staff/:id/assign-packages`

**Authentication:** Required (Admin or Executive Manager)

**Request Body:**
```json
{
  "package_ids": [1, 3, 5]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Packages assigned successfully",
  "assigned_count": 3
}
```

---

### 8. Get Staff Final Privileges

**Endpoint:** `GET /api/staff/:id/final-privileges`

**Authentication:** Required

**Description:** Get computed privileges for a staff member (packages + grants - revokes)

**Success Response (200 OK):**
```json
{
  "success": true,
  "staff_id": 5,
  "count": 25,
  "privileges": [
    {
      "id": 1,
      "code": "VIEW_MEMBERS",
      "name_en": "View Members",
      "name_ar": "عرض الأعضاء",
      "module": "Members",
      "is_active": true
    },
    {
      "id": 2,
      "code": "CREATE_MEMBER",
      "name_en": "Create Member",
      "name_ar": "إنشاء عضو",
      "module": "Members",
      "is_active": true
    }
  ]
}
```

---

### 9. Grant Privilege to Staff

**Endpoint:** `POST /api/staff/:id/grant-privilege`

**Authentication:** Required (Admin or Executive Manager)

**Request Body:**
```json
{
  "privilege_id": 15
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Privilege granted successfully"
}
```

---

### 10. Revoke Privilege from Staff

**Endpoint:** `POST /api/staff/:id/revoke-privilege`

**Authentication:** Required (Admin or Executive Manager)

**Request Body:**
```json
{
  "privilege_id": 15
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Privilege revoked successfully"
}
```

---

### 11. Get Staff Activity Logs

**Endpoint:** `GET /api/staff/:id/activity-logs`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 50)

**Success Response (200 OK):**
```json
{
  "success": true,
  "staff_id": 5,
  "count": 10,
  "logs": [
    {
      "id": 100,
      "action": "LOGIN",
      "details": "User logged in successfully",
      "ip_address": "192.168.1.1",
      "created_at": "2024-02-13T10:30:00.000Z"
    }
  ]
}
```

---

## Sport Management APIs

### 1. Create Sport

**Endpoint:** `POST /api/sports`

**Authentication:** Required (Sport Manager or Sport Specialist)

**Description:** Create a new sport. Managers can create with 'active' status, Specialists create with 'pending' status.

**Request Body:**
```json
{
  "name_en": "Football",
  "name_ar": "كرة القدم",
  "description_en": "Team sport played with a spherical ball",
  "description_ar": "رياضة جماعية تلعب بكرة كروية",
  "category": "team_sport",
  "max_participants": 22,
  "min_age": 6,
  "max_age": null,
  "equipment_required": "Ball, Goals, Field",
  "status": "active"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Sport created successfully",
  "sport": {
    "id": 15,
    "name_en": "Football",
    "name_ar": "كرة القدم",
    "status": "active",
    "created_by_staff_id": 5,
    "created_at": "2024-02-13T10:00:00.000Z"
  }
}
```

---

### 2. Get All Sports

**Endpoint:** `GET /api/sports`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (active, pending, inactive)
- `category` (optional): Filter by category

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "name_en": "Football",
      "name_ar": "كرة القدم",
      "category": "team_sport",
      "status": "active",
      "max_participants": 22,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Sport by ID

**Endpoint:** `GET /api/sports/:id`

**Authentication:** Required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name_en": "Football",
    "name_ar": "كرة القدم",
    "description_en": "Team sport",
    "description_ar": "رياضة جماعية",
    "category": "team_sport",
    "max_participants": 22,
    "min_age": 6,
    "max_age": null,
    "equipment_required": "Ball, Goals",
    "status": "active",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 4. Update Sport

**Endpoint:** `PUT /api/sports/:id`

**Authentication:** Required (Sport Manager or Sport Specialist)

**Request Body:**
```json
{
  "name_en": "Football Updated",
  "max_participants": 24,
  "description_en": "Updated description"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Sport updated successfully"
}
```

---

### 5. Approve Sport

**Endpoint:** `POST /api/sports/:id/approve`

**Authentication:** Required (Sport Manager only)

**Request Body:**
```json
{
  "approved": true,
  "notes": "Approved for club activities"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Sport approved successfully"
}
```

---

### 6. Delete Sport

**Endpoint:** `DELETE /api/sports/:id`

**Authentication:** Required (Sport Manager only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Sport deleted successfully"
}
```

---

### 7. Toggle Sport Status

**Endpoint:** `PATCH /api/sports/:id/toggle-status`

**Authentication:** Required (Sport Manager only)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Sport status toggled successfully",
  "new_status": "inactive"
}
```

---

## Membership APIs

### 1. Get All Membership Plans

**Endpoint:** `GET /api/membership`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name_en": "Basic Membership",
      "name_ar": "العضوية الأساسية",
      "description_en": "Basic club access",
      "description_ar": "وصول أساسي للنادي",
      "price": 500.00,
      "duration_months": 12,
      "is_active": true
    }
  ]
}
```

---

### 2. Get Membership Plan by ID

**Endpoint:** `GET /api/membership/:id`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name_en": "Basic Membership",
    "name_ar": "العضوية الأساسية",
    "price": 500.00,
    "duration_months": 12,
    "benefits": ["Pool access", "Gym access"],
    "is_active": true
  }
}
```

---

## Registration APIs

### 1. Register Basic Member

**Endpoint:** `POST /api/register/basic`

**Authentication:** Not required

**Description:** Step 1 of member registration - Create basic account

**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "SecurePassword123!",
  "first_name_en": "Ahmed",
  "first_name_ar": "أحمد",
  "last_name_en": "Hassan",
  "last_name_ar": "حسن",
  "gender": "male",
  "nationality": "Egyptian",
  "date_of_birth": "1990-05-15"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Basic registration completed",
  "member_id": 150,
  "next_step": "determine_membership"
}
```

---

### 2. Register Complete Working Member

**Endpoint:** `POST /api/register/register-working-member`

**Authentication:** Not required

**Description:** Single-step registration for working members

**Request Body:**
```json
{
  "email": "working@example.com",
  "password": "Password123!",
  "first_name_en": "Mohamed",
  "first_name_ar": "محمد",
  "last_name_en": "Ali",
  "last_name_ar": "علي",
  "gender": "male",
  "nationality": "Egyptian",
  "date_of_birth": "1985-03-20",
  "national_id": "28503201234567",
  "phone": "+201234567890",
  "address": "Cairo, Egypt",
  "profession_id": 5,
  "monthly_salary": 5000.00,
  "employment_status": "employed",
  "company_name": "Tech Corp"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Working member registered successfully",
  "member_id": 151,
  "account_id": 200,
  "membership_id": 75
}
```

---

### 3. Get Salary Brackets

**Endpoint:** `GET /api/register/salary-brackets`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "min_salary": 0,
      "max_salary": 3000,
      "membership_fee": 300
    },
    {
      "id": 2,
      "min_salary": 3001,
      "max_salary": 6000,
      "membership_fee": 500
    }
  ]
}
```

---

### 4. Submit Working Member Details

**Endpoint:** `POST /api/register/details/working-member`

**Authentication:** Not required

**Request Body:**
```json
{
  "member_id": 150,
  "national_id": "28503201234567",
  "phone": "+201234567890",
  "address": "Cairo, Egypt",
  "profession_id": 5,
  "monthly_salary": 5000.00,
  "employment_status": "employed",
  "company_name": "Tech Corp",
  "work_address": "Smart Village, Giza"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Working member details submitted successfully",
  "member_id": 150
}
```

---

### 5. Calculate Working Membership Price

**Endpoint:** `POST /api/register/calculate-working-membership-price`

**Authentication:** Not required

**Request Body:**
```json
{
  "monthly_salary": 5000.00,
  "has_dependents": true,
  "dependent_count": 2
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "base_price": 500.00,
  "dependent_price": 200.00,
  "total_price": 700.00,
  "currency": "EGP"
}
```

---

### 6. Get Professions

**Endpoint:** `GET /api/register/professions`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 50,
  "data": [
    {
      "id": 1,
      "name_en": "Engineer",
      "name_ar": "مهندس",
      "is_active": true
    },
    {
      "id": 2,
      "name_en": "Doctor",
      "name_ar": "طبيب",
      "is_active": true
    }
  ]
}
```

---

## Team Member APIs

### 1. Submit Team Member Details

**Endpoint:** `POST /api/register/details/team-member`

**Authentication:** Not required

**Content-Type:** `multipart/form-data`

**Form Data:**
```
member_id: 150
national_id: 12345678901234
phone: +201234567890
address: Cairo, Egypt
emergency_contact_name: John Doe
emergency_contact_phone: +201987654321
personal_photo: [file]
medical_report: [file]
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Team member details submitted successfully",
  "member_id": 150,
  "next_step": "select_teams"
}
```

---

### 2. Select Teams

**Endpoint:** `POST /api/register/team-member/select-teams`

**Authentication:** Not required

**Request Body:**
```json
{
  "member_id": 150,
  "sport_ids": [1, 3, 5]
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Teams selected successfully",
  "selected_count": 3
}
```

---

### 3. Get Team Member Status

**Endpoint:** `GET /api/register/team-member/status/:member_id`

**Authentication:** Not required

**Success Response (200 OK):**
```json
{
  "success": true,
  "member_id": 150,
  "status": "pending_approval",
  "details_submitted": true,
  "teams_selected": true,
  "selected_sports": [
    {
      "id": 1,
      "name_en": "Football",
      "name_ar": "كرة القدم"
    }
  ]
}
```

---

### 4. Review All Team Members (Sport Staff Only)

**Endpoint:** `GET /api/register/team-member/review-all`

**Authentication:** Required (Sport Manager or Sport Specialist)

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "member_id": 150,
      "first_name_en": "Ahmed",
      "last_name_en": "Hassan",
      "national_id": "12345678901234",
      "phone": "+201234567890",
      "selected_sports": ["Football", "Basketball"],
      "status": "pending_approval",
      "submitted_at": "2024-02-13T10:00:00.000Z"
    }
  ]
}
```

---

## Member Administration APIs

### 1. Get All Members

**Endpoint:** `GET /api/members`

**Authentication:** Required

**Privilege:** `VIEW_MEMBERS`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `member_type_id` (optional): Filter by member type

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "first_name_en": "Ahmed",
      "last_name_en": "Hassan",
      "email": "ahmed@example.com",
      "member_type": "Working Member",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "pages": 25
  }
}
```

---

### 2. Get Member by ID

**Endpoint:** `GET /api/members/:id`

**Authentication:** Required

**Privilege:** `VIEW_MEMBERS`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 150,
    "first_name_en": "Ahmed",
    "last_name_en": "Hassan",
    "email": "ahmed@example.com",
    "phone": "+201234567890",
    "national_id": "12345678901234",
    "member_type_id": 2,
    "member_type": "Working Member",
    "status": "active",
    "membership_plan": {
      "id": 1,
      "name_en": "Basic Membership",
      "expires_at": "2025-01-01T00:00:00.000Z"
    }
  }
}
```

---

### 3. Create Member

**Endpoint:** `POST /api/members`

**Authentication:** Required

**Privilege:** `CREATE_MEMBER`

**Request Body:**
```json
{
  "email": "newmember@example.com",
  "password": "Password123!",
  "first_name_en": "Sara",
  "last_name_en": "Ahmed",
  "member_type_id": 2,
  "phone": "+201234567890",
  "national_id": "29012345678901"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Member created successfully",
  "member_id": 151
}
```

---

### 4. Update Member

**Endpoint:** `PUT /api/members/:id`

**Authentication:** Required

**Privilege:** `UPDATE_MEMBER`

**Request Body:**
```json
{
  "phone": "+201987654321",
  "address": "New Address, Cairo"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Member updated successfully"
}
```

---

### 5. Change Member Status

**Endpoint:** `PATCH /api/members/:id/status`

**Authentication:** Required

**Privilege:** `CHANGE_MEMBER_STATUS`

**Request Body:**
```json
{
  "status": "suspended",
  "reason": "Payment overdue"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Member status changed successfully",
  "new_status": "suspended"
}
```

---

### 6. Get All Membership Plans (Admin)

**Endpoint:** `GET /api/membership-plans`

**Authentication:** Required

**Privilege:** `VIEW_MEMBERSHIP_PLANS`

**Success Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name_en": "Basic Membership",
      "name_ar": "العضوية الأساسية",
      "price": 500.00,
      "duration_months": 12,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 7. Create Membership Plan

**Endpoint:** `POST /api/membership-plans`

**Authentication:** Required

**Privilege:** `CREATE_MEMBERSHIP_PLAN`

**Request Body:**
```json
{
  "name_en": "Premium Membership",
  "name_ar": "العضوية المميزة",
  "description_en": "Full access to all facilities",
  "description_ar": "وصول كامل لجميع المرافق",
  "price": 1500.00,
  "duration_months": 12,
  "member_type_id": 2,
  "benefits": ["Pool", "Gym", "Tennis Courts"]
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Membership plan created successfully",
  "plan_id": 6
}
```

---

### 8. Assign Membership Plan to Member

**Endpoint:** `POST /api/members/:member_id/membership-plan`

**Authentication:** Required

**Privilege:** `ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER`

**Request Body:**
```json
{
  "plan_id": 1,
  "start_date": "2024-02-13",
  "payment_method": "cash",
  "payment_amount": 500.00
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Membership plan assigned successfully",
  "membership_id": 75,
  "expires_at": "2025-02-13T00:00:00.000Z"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "error": "Detailed error information"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authorization required. Please provide a valid JWT token."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## Notes

1. **Authentication**: Most endpoints require a valid JWT token in the Authorization header
2. **Privileges**: Admin endpoints check for specific privileges assigned to the staff member
3. **Pagination**: List endpoints support `page` and `limit` query parameters
4. **Date Format**: All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)
5. **File Uploads**: Use `multipart/form-data` content type for endpoints that accept files
6. **Arabic Support**: Most text fields support both English (`_en`) and Arabic (`_ar`) versions

---

**Last Updated:** February 13, 2026
**API Version:** 1.0
